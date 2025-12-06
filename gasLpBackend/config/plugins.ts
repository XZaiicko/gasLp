export default (env) => ({
 email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, //👈 importante para 465
        auth: {
        //   user: 'miguelalejandrovalencianaherna@gmail.com',
          user: '482200490@alumnos.utzac.edu.mx',
          pass: 'phui ltfd xczr nzuw', // 👈 ojo: debe ser "contraseña de aplicación" de Gmail
        },
        tls: {
          rejectUnauthorized: false, // 👈 evita el error del certificado
        },
      },
      settings: {
        defaultFrom: '482200490@alumnos.utzac.edu.mx',
        defaultReplyTo: '482200490@alumnos.utzac.edu.mx',
      },
    },
  },
});
