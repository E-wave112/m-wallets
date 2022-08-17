export interface ResponseStruct {
    statusCode: number;
    message?: string;
    data?: any;
}

export interface ErrorStruct {
    statusCode: number;
    message?: string;
    error?: any;
}
