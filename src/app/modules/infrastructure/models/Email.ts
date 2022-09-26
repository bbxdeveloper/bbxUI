export interface EmailAddress {
    name?: string;
    email: string;
}

export interface SendEmailRequest {
    from: EmailAddress;
    to: EmailAddress;
    body_html_text?: string;
    subject: string;
    OfferID: number;
}

export interface SendEmailResponse {

}