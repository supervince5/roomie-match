# roomiematch verification email

`verification.json` is the canonical Cognito `VerificationMessageTemplate` object. It contains the real `{####}` placeholder exactly once. Cognito inserts the code; the app never renders or emails the sample `123456` from the preview. The generic wording works for signup, resend confirmation, email verification, and password reset. These flows share Cognito's code template.

The HTML uses inline styles, presentation tables, local system fonts, and the app's design tokens. It contains no remote assets, tracking, or app links. A browser preview is useful for layout review but does not prove Gmail/Outlook rendering or email delivery.

## Sender prerequisite and guarded infrastructure

As inspected on October 16, 2026, `us-east-1_GNakJyokr` uses `COGNITO_DEFAULT`, and there are no SES identities in `us-east-1`. AWS's CloudFormation reference requires `EmailSendingAccount: DEVELOPER` for custom `EmailMessage` and `EmailSubject`.

`serverless.yml` enables the branded template only when **both** `emailSourceArn` and `emailFrom` Serverless parameters are nonempty. With neither parameter, the existing default-sender resource remains unchanged. Supply both parameters together and keep them in the deployment configuration for every subsequent deployment; omitting them later removes the branded configuration.

Before enabling:

1. Choose a sender domain/address owned by the operator, verify it in SES `us-east-1`, and ensure the sending identity is authorized for Cognito. This template does not create or verify an identity.
2. Confirm SES production access and sending quotas for the intended recipients. Sandbox identities cannot send to arbitrary unverified recipients.
3. Set `emailSourceArn` to that SES identity ARN and `emailFrom` to `roomiematch <verified-address>`. The address must belong to the verified identity. Do not substitute an invented address or the Cognito default sender.

This uses Cognito's native template, so no Lambda email sender or new email package is needed. SES remains responsible for delivery. A Gmail sender avatar/logo is separate from the HTML body and is not configured here.

## Safe rollout for the existing pool

Do not use a minimal `aws cognito-idp update-user-pool` request: omitted settings can revert to defaults. Do not run a full application deploy solely to change this email when unrelated backend work is pending.

Once SES is ready:

1. Read the existing `roomie-match-backend-dev` CloudFormation stack template, parameters, and current user-pool settings. Confirm `UserPool` maps to `us-east-1_GNakJyokr`; check for drift before updating.
2. Preserve the deployed stack template and parameters. In a working copy change **only** `Resources.UserPool.Properties.EmailConfiguration` to the approved SES developer configuration and `Resources.UserPool.Properties.VerificationMessageTemplate` to the exact object in `verification.json`. Preserve other email-configuration fields if already present. If the pool already has the intended SES configuration, only the template needs changing.
3. Create an UPDATE CloudFormation change set from that copy, preserving stack parameters with `UsePreviousValue`, stack capabilities, and role configuration. Inspect it before execution: the only changed resource must be `UserPool`, with no replacement, and only the intended email properties may differ. Unexpected drift or changes need resolution first.
4. Execute the reviewed change set when deployment is authorized; read back the pool configuration and compare the three template fields to the canonical JSON. This has no effect on the current code-verification API contract.
5. Send a code only through an explicitly authorized signup/reset test to a test inbox. Verify delivery, visible code, mobile layout, copy/paste, and successful confirmation/reset. Browser checks alone are not inbox checks.
6. Keep the matching sender parameters in the normal Serverless deployment configuration so future deploys preserve the template. For rollback, restore the exact previous email configuration and template through another reviewed change set.

References:

- [Cognito message customization](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pool-settings-message-customizations.html)
- [CloudFormation VerificationMessageTemplate](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-properties-cognito-userpool-verificationmessagetemplate.html)
- [Cognito email settings](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-email.html)
