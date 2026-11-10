export function FormFeedback({ error, message }: { error: string; message: string }) {
    return (
        <>
            {error && (
                <p className="gs-error" role="alert">
                    {error}
                </p>
            )}
            {message && (
                <p className="gs-notice" role="status">
                    {message}
                </p>
            )}
        </>
    );
}
