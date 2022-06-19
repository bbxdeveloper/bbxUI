export interface EmailAddress {
    name?: string;
    email: string;
}

export interface SendEmailRequest {
    from: EmailAddress;
    to: EmailAddress;
    bodyPlainText?: string;
    body_html_text?: string;
    subject: string;
}

export interface SendEmailResponse {

}