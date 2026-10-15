FROM lizheming/waline:1.43.4@sha256:a0889757b9d0ffe4a6730440000e84ad0fe7ae93f572f93d03218390447c78c0
WORKDIR /app
# Use the N-API implementation. The upstream v11 addon crashes during GC with
# Node 24.19+ ObjectWrap cleanup hooks (nodejs/node#65446).
RUN npm pkg set overrides.better-sqlite3=13.0.3 \
    && npm install --omit=dev \
    && npm ls better-sqlite3 \
    && node -e "const Database=require('better-sqlite3');const db=new Database(':memory:');db.exec('CREATE TABLE t (n INTEGER)');db.prepare('INSERT INTO t VALUES (?)').run(7);for(let i=0;i<40000;i++){if(db.prepare('SELECT n FROM t').get().n!==7)throw Error('SQLite read failed');}db.close();console.log('SQLite write/read/statement GC check passed')"
