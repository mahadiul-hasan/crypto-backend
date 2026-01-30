// templates/emailTemplates.ts
export const emailTemplates = {
  verification: (name: string, code: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code { 
          background: #4F46E5; 
          color: white; 
          padding: 15px 25px; 
          font-size: 24px; 
          font-weight: bold; 
          letter-spacing: 5px; 
          text-align: center; 
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { 
          margin-top: 30px; 
          padding-top: 20px; 
          border-top: 1px solid #ddd; 
          color: #666; 
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Verify Your Email</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering! Please use the verification code below to complete your registration:</p>
          <div class="code">${code}</div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>Your App Team</p>
        </div>
      </div>
    </body>
    </html>
  `,

  passwordReset: (name: string, resetLink: string) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #EF4444; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { 
          display: inline-block; 
          padding: 12px 24px; 
          background: #EF4444; 
          color: white; 
          text-decoration: none; 
          border-radius: 5px; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset Your Password</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request a password reset, please ignore this email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  adminPaymentSubmitted: (
    userName: string,
    userEmail: string,
    amount: number,
    courseName: string,
    paymentId: string,
  ) => `
  <!DOCTYPE html>
  <html>
  <body>
    <h2>New Payment Submitted</h2>

    <p><strong>User:</strong> ${userName}</p>
    <p><strong>Email:</strong> ${userEmail}</p>
    <p><strong>Course:</strong> ${courseName}</p>
    <p><strong>Amount:</strong> ৳${amount}</p>
    <p><strong>Payment ID:</strong> ${paymentId}</p>

    <p>Please review and verify.</p>
  </body>
  </html>
  `,
  paymentSuccess: (
    name: string,
    amount: number,
    courseName: string,
    transactionId: string,
  ) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial; color: #333; }
      .container { max-width:600px;margin:auto;padding:20px; }
      .header { background:#22C55E;color:white;padding:20px;text-align:center; }
      .content { background:#f9f9f9;padding:25px; }
      .badge { background:#22C55E;color:white;padding:8px 15px;border-radius:5px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Payment Successful</h1>
      </div>

      <div class="content">
        <p>Hello <strong>${name}</strong>,</p>

        <p>Your payment has been successfully processed.</p>

        <p>
          <span class="badge">PAID</span>
        </p>

        <ul>
          <li><strong>Course:</strong> ${courseName}</li>
          <li><strong>Amount:</strong> ৳${amount}</li>
          <li><strong>Transaction ID:</strong> ${transactionId}</li>
        </ul>

        <p>You now have full access.</p>

        <p>Thank you for learning with us.</p>
      </div>
    </div>
  </body>
  </html>
  `,

  paymentFailed: (
    name: string,
    amount: number,
    courseName: string,
    reason: string,
  ) => `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: Arial; color: #333; }
      .container { max-width:600px;margin:auto;padding:20px; }
      .header { background:#EF4444;color:white;padding:20px;text-align:center; }
      .content { background:#f9f9f9;padding:25px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Payment Failed</h1>
      </div>

      <div class="content">
        <p>Hello <strong>${name}</strong>,</p>

        <p>Unfortunately, your payment could not be completed.</p>

        <ul>
          <li><strong>Course:</strong> ${courseName}</li>
          <li><strong>Amount:</strong> ৳${amount}</li>
          <li><strong>Reason:</strong> ${reason}</li>
        </ul>

        <p>Please try again or contact support.</p>
      </div>
    </div>
  </body>
  </html>
  `,
};
