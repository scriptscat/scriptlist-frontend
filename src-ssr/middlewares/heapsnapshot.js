import { ssrMiddleware } from 'quasar/wrappers';
import { writeSnapshot } from 'heapdump';

export default ssrMiddleware(({ app }) => {
  app.get('/heapdump', () => {
    writeSnapshot('heapdump.heapsnapshot');
  });
});
