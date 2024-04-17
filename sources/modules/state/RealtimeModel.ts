import { InvalidateSync } from "teslabot";
import { Jotai } from "./_types";
import { AppState } from "react-native";
import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';
import { SuperClient } from "../api/client";
import { log } from "../../utils/logs";
import { backoff } from "../../utils/time";
import { atom, useAtomValue } from "jotai";

export class RealtimeModel {
    readonly jotai: Jotai;
    readonly client: SuperClient;
    readonly #sync: InvalidateSync;
    readonly state = atom('');
    #buffer: { data: Uint8Array, format: 'mulaw-8' | 'mulaw-16' } | null = null;
    #client: LiveClient | null = null;
    #capturing = false;
    #transcripts: string[] = [];
    #pendingTranscript: string | null = null;

    constructor(client: SuperClient, jotai: Jotai) {
        this.jotai = jotai;
        this.client = client;
        this.#sync = new InvalidateSync(this.#doSync, { backoff });
        this.#sync.invalidate();
        AppState.addEventListener('change', () => this.#sync.invalidate());
    }

    onCaptureStart = () => {
        this.#capturing = true;
        this.#sync.invalidate();
    }

    onCaptureStop = () => {
        this.#capturing = false;
        this.#sync.invalidate();
    }

    onCaptureFrame = (frame: Uint8Array, format: 'mulaw-8' | 'mulaw-16') => {

        // Ignore if not active
        if (AppState.currentState !== 'active' || !this.#capturing) {
            return;
        }

        // Discard if format changed
        if (this.#buffer && this.#buffer.format !== format) {
            this.#buffer = null;
        }

        // Append to buffer
        if (!this.#buffer) {
            this.#buffer = { data: frame, format };
        } else {
            let merged = new Uint8Array(this.#buffer.data.length + frame.length);
            merged.set(this.#buffer.data, 0);
            merged.set(frame, this.#buffer.data.length);
            this.#buffer = { data: merged, format };
        }
        this.#sync.invalidate();
    }

    #flushUI = () => {
        console.warn(this.#transcripts);
        let data = [...this.#transcripts];
        if (this.#pendingTranscript) {
            data.push(this.#pendingTranscript);
        }
        if (data.length > 3) { // Keep last 3
            data = data.slice(data.length - 3);
        }
        this.jotai.set(this.state, this.#transcripts.join("\n") + (this.#pendingTranscript ? ('\n' + this.#pendingTranscript) : ''));
    }

    #doSync = async () => {

        // Clear buffer if not active
        if (AppState.currentState !== 'active' || !this.#capturing) {
            this.#buffer = null;
            if (this.#client) {
                log('DG', "Closing connection");
                this.#client.finish();
                this.#client = null;
                this.#transcripts = [];
                this.#pendingTranscript = null;
                this.#flushUI();
            }
            return;
        }

        // Read from buffer
        if (!this.#buffer) {
            return;
        }
        const format = this.#buffer.format
        const buffer = this.#buffer.data.slice();
        this.#buffer = null;

        // Create a deepgram client if needed
        if (!this.#client) {

            log('DG', "Creating connection");

            // Fetch API key
            let token = await this.client.getDeepgramToken();

            // Create client
            const client = createClient(token);

            // Create live client
            this.#client = client.listen.live({
                model: "nova",
                interim_results: true,
                smart_format: true,
                diarize: true,
                encoding: 'mulaw',
                sample_rate: format === 'mulaw-8' ? 8000 : 16000,
                channels: 1,
            });

            this.#client.on(LiveTranscriptionEvents.Open, () => {
                log('DG', "connection established");
            });

            this.#client.on(LiveTranscriptionEvents.Close, () => {
                log('DG', "connection closed");
            });

            this.#client.on(LiveTranscriptionEvents.Transcript, (data) => {
                const isFinal = data.is_final as boolean;
                const words = data.channel.alternatives[0].words as { word: string, speaker: number }[];
                if (words.length === 0) {
                    this.#pendingTranscript = null;
                } else {
                    let transcript = words.map(w => w.word).join(" ");
                    if (isFinal) {
                        this.#transcripts.push(transcript);
                        this.#pendingTranscript = null;
                    } else {
                        this.#pendingTranscript = transcript;
                    }
                }
                this.#flushUI();
            });

            log('DG', "Connection created");
        }

        // Push data to client
        this.#client.send(buffer);
    };

    use() {
        return useAtomValue(this.state);
    }
}