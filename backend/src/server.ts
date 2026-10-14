import { app } from './app.js';
import { startCollectionJob, stopCollectionJob } from './jobs/collections.job.js';

const port = Number(process.env.PORT ?? 3000);

const server = app.listen(port, () => {
    console.log(`Backend iniciado na porta ${port}`);
    startCollectionJob();
});

process.on('SIGTERM', () => {
    stopCollectionJob();
    server.close(() => process.exit(0));
});
