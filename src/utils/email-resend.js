import * as emails from '@/lib/emails/templates/emailTemplates';

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export class Emails {
	constructor(user, url, business) {
		this.to = user.email;
		this.firstName = user.name.split(',')[0];
		this.url = url;
		this.business = business.businessName;
		this.from = 'support@wealthtech.website';

	}

	async send(template, subject) {
		//2)- Define emails options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html: template
		};

		resend.emails.send(mailOptions);
	}

	async sendWelcome() {
		await this.send('welcome', `Welcome to ${this.business}`);
	}

	async notifyNewUserActivation(newUser) {
		await this.send('notification', `Welcome to ${this.business}`);
	}

	async sendPasswordReset() {
		const html = emails.resetTemplate
			.replace('{{name}}', this.firstName)
			.replace('{{url}}', this.url);

		// const html = render(
		// 	<ResetPassword
		// 		userFirstname="wealth"
		// 		resetPasswordLink="www.eee.com"
		// 	/>
		// );
		await this.send(
			html,
			'Your password reset token (valid for only 10 minutes)'
		);
	}
	async sendInviteUser() {
		const html = emails.inviteTemplate
			.replace('{{name}}', this.firstName)
			.replace('{{url}}', this.url)
			.replace('{{business}}', this.business);

		// const html = render(
		// 	<ResetPassword
		// 		userFirstname="wealth"
		// 		resetPasswordLink="www.eee.com"
		// 	/>
		// );
		await this.send(
			html,
			'Your invite onboarding token (valid for only 24hours)'
		);
	}
}
