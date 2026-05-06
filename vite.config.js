import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dpiit: resolve(__dirname, 'ministry-dpiit.html'),
        moafw: resolve(__dirname, 'ministry-moafw.html'),
        mod: resolve(__dirname, 'ministry-mod.html'),
        moe: resolve(__dirname, 'ministry-moe.html'),
        mof: resolve(__dirname, 'ministry-mof.html'),
        mohua: resolve(__dirname, 'ministry-mohua.html'),
        molaboremployment: resolve(__dirname, 'ministry-molaboremployment.html'),
        mosje: resolve(__dirname, 'ministry-mosje.html'),
        mowcd: resolve(__dirname, 'ministry-mowcd.html'),
        msde: resolve(__dirname, 'ministry-msde.html'),
        msme: resolve(__dirname, 'ministry-msme.html'),
        niti: resolve(__dirname, 'ministry-niti.html'),
      },
    },
  },
});
