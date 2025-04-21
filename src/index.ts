import express, { Request, Response } from 'express';

export const app = express();

const PORT = process.env.PORT || 4000;

app.get('/', (req: Request, res: Response) => {
  res.send({message: 'Welcome to KAAAJ API'});
});

// Only listen once and export the server
export const server = app.listen(PORT, () =>  {
  console.log(`🚀 Server listening on PORT: ${PORT}`);
});
