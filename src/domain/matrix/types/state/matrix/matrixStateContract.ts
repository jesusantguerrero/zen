export interface MatrixStateContract {
    markAsDone(): void
    trackTime(): void
    schedule(): void;
    delegate(): void;
    delete(): void;
    setDeleteAutomation(): void
}