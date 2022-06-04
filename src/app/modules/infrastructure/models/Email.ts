export interface EmailAddress {
    name?: string;
    email: string;
}

export interface SendEmailRequest {
    from: EmailAddress;
    to: EmailAddress;
    bodyPlainText?: string;
    bodyHtmlText?: string;
    subject: string;
}

export interface SendEmailResponse {

}