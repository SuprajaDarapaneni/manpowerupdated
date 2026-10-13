import { createApp } from './app';

const app = createApp();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`ManPowerLink Central Backend listening on port ${PORT}`);
});
