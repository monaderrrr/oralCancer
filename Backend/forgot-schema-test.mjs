import { forgetPasswordSchema } from './src/Validators/auth.schema.js';
const tests = ['user@example.com','user@example.org','user@example.net','user@gmail.com','user@yahoo.com','invalid-email'];
for (const email of tests) {
  const { error } = forgetPasswordSchema.body.validate({ email }, { abortEarly: false });
  console.log('TEST', email);
  if (!error) {
    console.log('  OK');
  } else {
    console.log('  ERROR', error.details.map(d => ({ message: d.message, path: d.path, type: d.type }))); 
  }
}
