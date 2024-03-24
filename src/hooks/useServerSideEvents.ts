import {EventStreamContentType, fetchEventSource} from "@microsoft/fetch-event-source";

class RetriableError extends Error { }
class FatalError extends Error { }

export default function useServerSentEvents<
    T extends Record<any, any>
    >({
          baseUrl,
          onData,
          onOpen,
          onClose,
          onError,
      }: {
    baseUrl: string
    onData: (data: string) => void
    onOpen: () => void
    onClose: () => void
    onError: (event: Error) => void
}) {
    function openStream<T>(body: T): AbortController {
        const ctrl = new AbortController();
        fetchEventSource(baseUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            async onopen(response) {
                if (response.ok && response.headers.get('content-type')?.includes(EventStreamContentType)) {
                    onOpen();
                    return; // everything's good
                } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
                    // client-side errors are usually non-retriable:
                    throw new FatalError();
                } else {
                    throw new RetriableError();
                }
            },
            onmessage(msg) {
                // if the server emits an error message, throw an exception
                // so it gets handled by the onerror callback below:
                if (msg.event === 'FatalError') {
                    throw new FatalError(msg.data);
                } else {
                    onData(msg.data);
                }
            },
            onclose() {
                onClose();
                throw new FatalError()
            },
            onerror(err) {
                if (err instanceof FatalError) {
                    onError(err);
                } else {
                   onError(err);
                }
                throw err;
            },
            signal: ctrl.signal
        }).then(r => {});
        return ctrl
    }

    function closeStream(sig: AbortController) {
        sig.abort()
    }

    return { openStream, closeStream }
}