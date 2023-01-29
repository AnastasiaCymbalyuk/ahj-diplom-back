const http = require('http');
const Koa = require('koa');
const cors = require('koa2-cors');
const { send } = require('process');
const WS = require('ws');
const { v4: uuidv4 } = require('uuid');

const app = new Koa();
app.use(
  cors({
    origin: '*',
    credentials: true,
    'Access-Control-Allow-Origin': true,
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
  }),
);

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());
const ws = new WS.Server({ server });

const arrWeather = [
  { text: '-2..0° Облачно. Небольшой дождь', type: 'botMsg', },
  { text: '-3..-1° Солнечно. Преимущественно без осадков. Гололедица', type: 'botMsg' },
  { text: '-2..0° Переменная облачность. Без осадков', type: 'botMsg' },
  { text: '-6..-1° Небольшая облачность, без осадков', type: 'botMsg' },
  { text: '-1..+1° Солнечно. Местами возможен дождь', type: 'botMsg' },
  { text: '-5..-3° Сильный порывистый ветер. Местами возможен град', type: 'botMsg' },
  { text: '-3..-1° Облачно. Без осадков', type: 'botMsg' },
  { text: '-4..-2° Гололедица Облачно с прояснениями. Преимущественно без осадков', type: 'botMsg' },
];

let arr = [
  { id: uuidv4(), text: 'Просто текст', time: '15.01.2022 10:20', type: 'text', link: false, name: null, favourites: false },
  { id: uuidv4(), text: `<a class="link_in_msg" href="https://netology.ru" target="_blank">https://netology.ru</a>`, time: '10.02.2022 10:20', type: 'text', link: true, name: null, favourites: true },
  { id: uuidv4(), text: `Просто текст + <a class="link_in_msg" href="https://netology.ru" target="_blank">https://netology.ru</a>`, time: '20.02.2022 10:22', type: 'text', link: true, name: null, favourites: false },
  { id: uuidv4(), text: 
`<pre class="language-js">
  <code class="language-js">
    if (true) {
      console.log('Hello, AHJ!');
    }
  </code>
</pre>
js code
  `, time: '1.04.2022 10:27', type: 'text', link: false, name: null, favourites: true },
  { id: uuidv4(), text: 
`<pre class="language-css">
  <code class="language-css">
  .title {
    font-size: 14px;
  }
  </code>
</pre>
css code
`, time: '12.04.2022 10:50', type: 'text', link: false, name: null, favourites: false },
  { id: uuidv4(), text: 'Просто текст и 😄', time: '10.06.2022 10:25', type: 'text', link: false, name: null, favourites: false },
];

ws.on('connection', (w) => {
  let messages = arr;
  w.send(JSON.stringify({ arr }));
  w.on('message', (msg) => {
    const request = JSON.parse(msg);
    if (request.event === 'push') {
      arr.push({
        id: request.id, 
        text: request.message,
        time: request.time,
        type: request.type,
        link: request.link,
        name: request.name,
        favourites: request.favourites
      });
    }
    if (request.event === 'scroll') {
      const messagesScroll = arr;
      w.send(JSON.stringify({ event: 'scroll', messagesScroll }));
    }
    if (request.event === 'img') {
      messages = arr.filter(item => /image/g.test(item.type));
      w.send(JSON.stringify({ messages }));
    }
    if (request.event === 'audio') {
      messages = arr.filter(item => /audio/g.test(item.type));
      w.send(JSON.stringify({ messages }));
    }
    if (request.event === 'video') {
      messages = arr.filter(item => /video/g.test(item.type));
      w.send(JSON.stringify({ messages }));
    }
    if (request.event === 'application') {
      messages = arr.filter(item => /application/g.test(item.type) || /text\//g.test(item.type));
      w.send(JSON.stringify({ messages }));
    }
    if (request.event === 'link') {
      messages = arr.filter(item => item.link);
      w.send(JSON.stringify({ messages }));
    }
    if (request.event === 'favourites') {
      messages = arr.filter(item => item.favourites);
      w.send(JSON.stringify({ messages }));
    }
    if (request.event === 'checkId') {
      arr.forEach(item => {
        if (item.id === request.id) {
          if(item.favourites === true){
            item.favourites = false;
          }else{
            item.favourites = true;
          }
        }
      });
    }
    if (request.event === 'weather') {
      w.send(JSON.stringify({ arrWeather }));
    }
    if (request.event === 'delete') {
      arr = [];
      w.send(JSON.stringify({ arr }));
    }
    if (request.event === 'number') {
      numberMsg = [
        { text: `
            изображений: ${arr.filter(item => /image/g.test(item.type)).length},
            аудио: ${arr.filter(item => /audio/g.test(item.type)).length},
            видео: ${arr.filter(item => /video/g.test(item.type)).length},
            файлов: ${arr.filter(item => /application/g.test(item.type) || /text\//g.test(item.type)).length},
            ссылок:  ${arr.filter(item => item.link).length},`, 
          type: 'botMsg', }
      ];
      w.send(JSON.stringify({ numberMsg }));
    }
    if (request.event === 'date') {
      messages = arr.filter(item => RegExp(`${request.message}`, 'g').test(item.time));
      w.send(JSON.stringify({ messages }));
    }
    if (request.event === 'word') {
      messages = arr.filter(item => RegExp(`${request.message}`, 'g').test(item.text));
      w.send(JSON.stringify({ messages }));
    }
  });
});

server.listen(port, () => console.log(`Server has been started on ${port}...`));