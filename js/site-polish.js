(function(){
  // Load final cross-page polish stylesheet once.
  try{
    if(!document.querySelector('link[data-site-polish]')){
      var l=document.createElement('link');
      l.rel='stylesheet';
      l.href='/css/site-polish.css?v=6';
      l.setAttribute('data-site-polish','1');
      document.head.appendChild(l);
    }
  }catch(e){}

  // Remove redundant Cyber Lab copy called out in the mobile review.
  try{
    var explain=document.querySelector('.lab-intro-panel .lab-explain');
    if(explain) explain.remove();
    var locationNote=document.querySelector('.connection-panel .location-note');
    if(locationNote) locationNote.remove();
    var routeCopy=document.querySelector('.route-panel .section-copy p:last-child');
    if(routeCopy && !routeCopy.classList.contains('panel-label')) routeCopy.remove();
  }catch(e){}

  // Move page-load / unique-visitor count near the top instead of burying it.
  try{
    var count=document.querySelector('.visit-counter');
    var hero=document.querySelector('.identity-hero');
    if(count&&hero){
      count.classList.add('visit-counter-top');
      hero.parentNode.insertBefore(count,hero.nextSibling);
    }
  }catch(e){}

  // -----------------------------------------------------------------------
  // VPN kitty: DO NOT animate the full Aseprite sheet in the browser.
  // Each exact 32x32 frame is embedded below as its own PNG. This eliminates
  // Safari cropping/scaling/compositing problems and all competing .vpn-cat
  // background-position CSS. These frames were sliced from the verified
  // 256x320 kitty-custom-v2.png asset:
  //   idle       row y=0
  //   sad_cry    row y=256
  //   hacker_type row y=288
  // -----------------------------------------------------------------------
  var KITTY_IDLE=["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABD0lEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgMU+m4yKPbfwikft2IuZQ5AzgFJ6ZiJmNgySZZfEG/WJSobwsoBYoBi/y2GRRHJ8JxAKBuSHQK4AMxyYkMApwMYGRkZ9925QVI2xAbIDgFywOHntiQXRERVLOjpAFdxjF4UE/I9UQ7AVivCogZfJUSM5UQ7gNh2ATltBwAI7os0Wy5+BAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABD0lEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgMU+m4yKPbfwikft2IuZQ5AzgFJ6ZiJmNgySZZfEG/WJSobwsoBYoBi/y2GRRHJ8JxAKBuSHQK4AMxyYkMApwMYGRkZ9925QVI2xAbIDgFywOHntiQXRERVLOjpAFdxjF4UE/I9UQ7AVivCogZfJUSM5UQ7gNh2ATltBwAI7os0Wy5+BAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABD0lEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgMU+m4yKPbfwikft2IuZQ5AzgFJ6ZiJmNgySZZfEG/WJSobwsoBYoBi/y2GRRHJ8JxAKBuSHQK4AMxyYkMApwMYGRkZ9925QVI2xAbIDgFywOHntiQXRERVLOjpAFdxjF4UE/I9UQ7AVivCogZfJUSM5UQ7gNh2ATltBwAI7os0Wy5+BAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABHklEQVR42mNgGAWjYBSMglEwCkbBSAeMhBT8////P1wxIyMjsQbD9BHSw0LIECcVDRQ+MY74////f1l+QaL0sBDjm3kz/zMwbGVgcFLRQAkRXABmOcVRgBwC8/wg9iZtwq3l9uuXGGKPP75noDgEUELDD3cAHH4eDGdXbVtLlHlMREcBEcBW8jCc3eYVTD0H0BIMXQegZ0F0oNB3k0Gx/xZO+bgVc+E5Al/OwekARkZGxn13bkBSfjojNnmifEgoFzASlQWh5QAxQLH/FsOiiGSUnIDPEWSHAC4As5zYEKBqNqR6LoCFQlI6IwODN2HDDj+3RSmICPmeqNqQmByBrSgmxnKiHYBeLRNVyRCZTQBVHXv/R0Q7FQAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABDUlEQVR42mNgGAWjYBSMglEwCkbBSAeMhBT8////P1wxIyMjsQbD9BHSw0LIECcVDRQ+MY74////f1l+QaL0sBDjm3kz/zMwbGVgcFLRQAkRXABmOcVRgBwC8/wg9iZtwq3l9uuXGGKPP75noDgEUELDD3cAHH4eDGdXbVtLlHlMREcBEcBW8jCc3eYVTD0H0BIMXQco9N1kUOy/hVM+bsVcyhyAnAOS0jETMbFlkiy/IN6sS1Q2hJUDxADF/lsMiyKS4TmBUDYkOwRwAZjlxIYATgcwMjIy7rtzg6RsiA2QHQLIjkhKZ2Rg8CZs2eHntigFESHLiaoNsVVKxBTFxFhOtAPQq2WiKhkiswkACVF/hQVnUA4AAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABDUlEQVR42mNgGAWjYBSMglEwCkbBSAeMhBT8////P1wxIyMjsQbD9BHSw0LIECcVDRQ+MY74////f1l+QaL0sBDjm3kz/zMwbGVgcFLRQAkRXABmOcVRgBwC8/wg9iZtwq3l9uuXGGKPP75noDgEUELDD3cAHH4eDGdXbVtLlHlMREcBEcBW8jCc3eYVTD0H0BIMXQco9N1kUOy/hVM+bsVcyhyAnAOS0jETMbFlkiy/IN6sS1Q2hJUDxADF/lsMiyKS4TmBUDYkOwRwAZjlxIYATgcwMjIy7rtzg6RsiA2QHQLIjkhKZ2Rg8CZs2eHntigFESHLiaoNsVVKxBTFxFhOtAPQq2WiKhkiswkACVF/hQVnUA4AAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABDUlEQVR42mNgGAWjYBSMglEwCkbBSAeMhBT8////P1wxIyMjsQbD9BHSw0LIECcVDRQ+MY74////f1l+QaL0sBDjm3kz/zMwbGVgcFLRQAkRXABmOcVRgBwC8/wg9iZtwq3l9uuXGGKPP75noDgEUELDD3cAHH4eDGdXbVtLlHlMREcBEcBW8jCc3eYVTD0H0BIMXQco9N1kUOy/hVM+bsVcyhyAnAOS0jETMbFlkiy/IN6sS1Q2hJUDxADF/lsMiyKS4TmBUDYkOwRwAZjlxIYATgcwMjIy7rtzg6RsiA2QHQLIjkhKZ2Rg8CZs2eHntigFESHLiaoNsVVKxBTFxFhOtAPQq2WiKhkiswkACVF/hQVnUA4AAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABFklEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgMU+m4yKPbfwikft2Iu9RyQlI6ZiEkok8jLhihZEFoOEAMU+28xLIpIRskJ+LIizhBgZGRk3HfnBs4QwAVglhNbDjARHQJkAll+QbylJ1EhQCw4/NwWoyAiFAJEVSxOKhoo6QBXcYxeFBOynCgHYKsVcYUMciVEjOVEO4DYdgE5bQcAVHKHrqkDJoIAAAAASUVORK5CYII="];
  var KITTY_SAD=["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABAElEQVR42u1WsQ2DMBD8QyyRksZb0GWIVCmSCZiECWhSsUCkFHQUmSE0lFGm+BSRLYiw/UZGUSSfZAnJ/89zft9BlJCQkJCQkPBjwBfAzGyCAUgL67yQHFsRs6bNSPN8Obmk4NgpoisRAJI0EfLRmSSo2A+fRipFALwrBHnosYyVsu71z9I8H9smHgNjp0TFyl1vni+Hc7wGtsT/NnA7PaioB+t+1BlYQnt/bauEzMzTK+Wa/tmVrQczgJoFZrYqYuYQE2jNkd6Cpel3vdzZwJQBLUSrKPaoZ1QGloTIx4DIDQEYP9DnLDQlrxtCWGg2kDZGv2MkVhzs7y6PX/Pv8AZGfH6siCzTgAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABE0lEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgN2JN1kUOy/hVM+bsVc2jpgxfGXtA0B5CyYlI6ZiyIsxRnuF6rh9PmiiGR4mYCv7MDpAEZGRsZ9d27gzAUe89Sx6oNZTGw5QHYIEAtoFgLYCyJbjIKIUAgQVbE4qWjA6wN8xTF6UUzIcqIcgK1WhIUMvkqIGMuJdgCx7QJy2g4AeJOMlCbDi+gAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABCElEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+kjRg8sQOEZ2DLH6COlhIcbA+3vUGBi2MjAwMjIyEOMIUjzNRIwiRZdbEIcUqjEwMjISxKQAFlKj5X6hGk65w89t4ey4FXOpFwL396gRZZit5GE4e1FEMvUcQEswdB2wI+kmg2L/LZzyVE0D2MCK4y9pGwL/////D8tSsGyIDCIsxbHmCJjPYYmQUNnBhKcwYYTpQ88FCZqHGDzmqWPVh576////j7c4JisEFly3I76yoUUIkFIQEQoBompDRkZGeH3AwMCAN/WTEvxEOQA9OmAGE6qEiLGcaAcQ2y4gp+0AAEoYhBXBivkXAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABHklEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgN2JN1kUOy/hVM+bsVc2jpgxfGXtA0B5CyYlI6ZiyIsxRnuF6rh9PmiiGR4mYCv7MDpAEZGRsZ9d27gzAUe89Sx6oNZTGw5QFYIJGgeIjqIaRICEZbiDDZvG7AURLYYBRGhECCqYnFS0YDXB/iKY/SimJDlRDkAW60ICxl8lRAxlhPtAGLbBeS0HQCcRpAw8KjzPQAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABG0lEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+kjRg8sQOEZ2DLH6COlhIcbA+3vUGBi2MjAwMjIyEOMIUjzNRIwiRZdbEIcUqjEwMjISxKQAFlKj5X6hGk65w89t4ey4FXOpFwL396gRZZit5GE4e1FEMvUcQEswdB2wI+kmg2L/LZzyVE0D2MCK4y9pWxL+////P3KWwpf6UbJs/y14AoSFwv///3GWiEx4ChNGWJmDngt2JN3E6QD01I/PcrwOQA4BWEEEAx7z1IkPYgKlJ1khQEpBRCgEiKoNGRkZ4fUBAwMDQ4LmIYY7R/YxPF0URUgvZbUhttpt+uX//6Xjlv3HBsipOUmu3/HV8eS0HQCNyKIQL7S8mAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABL0lEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgN2JN1kUOy/hVM+bsVc2jpgxfGXKI6hegggZ8GkdMxcFGEpznC/UI2BgYGBwWOeOobPF0Ukw8sEfGUHTgcwMjIy7rtzA2suSNA8hGIpMoBZTGw5QFYILLhuR3QQUz0EdiTdZLB524CjILLFKIgoKgkZGRkZYSEBqw9giQ9bkXz79VqSgp+o6hhbrQgLGXyVEDGWE+0AYtsF5LQdACqSmFOaKuxjAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABJElEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+kjRg8sQOEZ2DLH6COlhIcbA+3vUGBi2MjAwMjIyEOMIUjzNRIwiRZdbEIcUqjEwMjISxKQAFlKj5X6hGk65w89t4ey4FXOpFwL396gRZZit5GE4e1FEMvUcQEswdB2wI+kmg2L/LZzyVE0D2MCK4y9RHEP1kvD/////kbMUvtSPkmX7b8ETICwU/v//j7NEZMJTmDDCyhz0XIDPx+ipH5/leB2AHAKwgggGPOap43TAXKdWjFIRX+nJSKhMZ2RkhBfFDAwMDAmahxjuHNnHcES4gaiCiFAIEFUbojsCX+onJfhJrhWnX/7/Xzpu2X9cgJyak+T6HV8dT07bAQB3Q6sWCWWnQAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABG0lEQVR42mNgGAWjYBSMglEwCkbBAANGQgr+////H66YkZGRWINh+gjpYSFkiJOKBgqfGEf8////vyy/IFF6WIjxzbyZ/xkYtjIwOKlooIQILgCznOIoQA6BeX4Qe5M24dZy+/VLDLHHH98zUBwCKKHhhzsADj8PhrOrtq0lyjwmoqOACGAreRjObvMKpp4DaAmGrgN2JN1kUOy/hVM+bsVc2jpgxfGXtA0B5CyYlI6ZiyIsxRnuF6rh9PmiiGR4mYCv7MDpAEZGRsZ9d27gzAUe89Sx6oNZTGw5QFYIJGgeIjqICYUAUSUhrCgmBA4/t8UoiAiFAFEVC7ojcBXH6EUxIcuJcgC2WhGWNvBVQsRYTrQDiG0XkNN2AACv1JCnlPZm+QAAAABJRU5ErkJggg=="];
  var KITTY_HACK=["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABVUlEQVR42mNgGAWjYBSMglEwwICRkIL/////hytmZGQk1mCYPlL04DIEjpEdQ6w+QnpYiDHw/h41BoatDAyMjIwMxDiCFE8zEaNI0eUWxCGFagyMjIwEMSmAhdRouV+ohlPu8HNbODtuxVzqhcD9PWpEGWYreRjOXhSRTD0H0BIMXQco9N1kUOy/hVOeqmkAHdjZqTFQUr4QVRL+////P7Il+FI/SpbtvwVPgLBQ+P//P84SkZA3/jMwMDASWwLiKJQYoZ5hJKkcsP1f/v8QQwcDAwPDf1l+QYqKc3z1AVGVkSy/IMNHNxmSLeff9YTh8cf38OCXXe/z/3HgFkayE6HBam8GgWgFBgYGBjhNjBwMoFtOVggYrPZmuBC6FcWiD0sfoDiEgYGB4ULoVowQGPAooKgy4t/1hCYlIQsxrRpVUXGKLMGXExiJbY5RXOLhcMCAV0YAOuqTgiS6rLcAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABU0lEQVR42mNgGAWjYBSMglEwwICRkIL/////hytmZGQk1mCYPkJ6WAgZ4qSigcInxhH/////L8svSJQeFmJ8M2/mfwaGrQwMTioaKCGCC8AspzgKkENgnh/E3qRNuLXcfv0SQ+zxx/cMFIcASmj44Q6Aw8+D4eyqbWuJMo+J6CggAthKHoaz27yCqecAWoLB6wCFvpsMiv23cMrHrZhLOwfY2akxkFAmkZcNbf+X/2dR2UBU6kcGiv23GBZFJKPkBEJZESdwVFb/DysPyAXoxTnR5QCSpv+klGzYzIH5Xna9z//HgVsYSa6MZPkFGT66yZBsOf+uJwSDn6REaLDam4GBgYFBIFqBQSBaAUMcmxwhQHJRLBCtwPBh6QMU/oXQrQwGq70ZHmy4iiJHtfYALaOAhRTDaAEINkgYGBgYVEXFKbIEX6OEkRgHUKXEw+GAAa+MAMzSyo8rQgrvAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABYklEQVR42u1WsWrDMBB9V7zbGUop1GAP9dLFP+BMpYs7tEOgYOjSL8iUv2i+oEshUPDQpV5KpuQHstaLAyl0bPIF16G10GJbshxCwQ8EQtLdPUl3TwJ69OjRo8eBQU0LmJnFYiJSdVza6dhUORFNJqNq12RjqTgs5gGQAUQEFRI6mz5SWeRf5r9ExgGIqLHpwNK9lmIcVM4tvyLRv3956u4Einmg5Cw6XYr+891DdwT2if9LwHv8gD/NK+eNciDiSW2pDYcBTPRFSQmZmeUgddlfkloscvjTXCRgeQrMDCIi9/WaN7dvpCPFDIBUFbBClOhvM6SlA1JQdu2BkZzXvQdWHXOZyO7qTDu4/f7ZfRWEaQwn8QAATuIhTGMxJ4/vpQzDNMZqlGE7W8NJPGxna6xGmSBSjns3F93+B1x70PoKNrtvtMqBNvfZBpbKr+b8+MQoSF0lkOp3zFjxKggc/DH6AftskOq5d6oqAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABW0lEQVR42mNgGAWjYBSMglEwwICRkIL/////hytmZGQk1mCYPkJ6WAgZ4qSigcInxhH/////L8svSJQeFmJ8M2/mfwaGrQwMTioaKCGCC8AspzgKkENgnh/EqRNuLXcfv0SQ+zxx/cMFIcASmj44Q6Aw8+D4eyqbWuJMo+J6CggAthKHoaz27yCqecAWoLB6wDbua8YbOe+wikft2IuUeawkGO5nZ0aA6OdGoRz6BZtSkL0Qghf6kcGiv23GBZFJKPkBEJZESdwVFb/D3MMuQC5WJZd7/Of6BCw/V/+/xBDB8klG6kFEdHl+kc3GZIt59/1hKADSM4FBqu94WyBaAUGgWgFrOLEApJygUC0AsOF0K0MBqu9GR5suMrwYekDuNyF0K0MAtEKDAoB2gwXQrdStz1AyyhgIcUwWgCCDRIGBgYGVVFxiizB1yhhJMYBVGn74XDAgFdGAAxEyzHDM+lFAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABXklEQVR42mNgGAWjYBSMglEwwICRkIL/////hytmZGQk1mCYPkJ6WAgZ4qSigcInxhH/////L8svSJQeFmJ8M2/mfwaGrQwMTioaKCGCC8AspzgKkENgnh/EqRNuLXcfv0SQ+zxx/cMFIcASmj44Q6Aw8+D4eyqbWuJMo+J6CggAthKHoaz27yCqecAWgK6OkB2vc9/qjlAoe8mg2L/LZzyVE0D2MCK4y9pWxL+////P3KWwpf6UbJs/y14AoSFwv///3GWiEx4ChNGWJmDngt2JN3E6QD01I/PcrwOQA4BWEEEAx7z1IkPYgKlJ1khQEpBRCgEiKoNGRkZ4fUBAwMDQ4LmIYY7R/YxPF0URUgvZbUhttpt+uX//6Xjlv3HBsipOUmu3/HV8eS0HQCNyKIQL7S8mAAAAABJRU5ErkJggg==","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABZUlEQVR42mNgGAWjYBSMglEwwICRkIL/////hytmZGQk1mCYPkJ6WAgZ4qSigcInxhH/////L8svSJQeFmJ8M2/mfwaGrQwMTioaKCGCC8AspzgKkENgnh/EqRNuLXcfv0SQ+zxx/cMFIcASmj44Q6Aw8+D4eyqbWuJMo+J6CggAthKHoaz27yCqecAWoKh6wDbua8YbOe+wikft2IuUeawkGO5nZ0aA6OdGoRz6BZtSkL0Qghf6kcGiv23GBZFJKPkBEJZESdwVFb/D3MMuQC5WJZd7/Of6BCw/V/+/xBDB8klG6kFEdHl+kc3GZIt59/1hKADSM4FBqu94WyBaAUGgWgFrOLEApJygUC0AsOF0K0MBqu9GR5suMrwYekDuNyF0K0MAtEKDAoB2gwXQrdStz1AyyhgIcUwWgCCDRIGBgYGVVFxiizB1yhhJMYBVGn74XDAgFdGAAxEyzHDM+lFAAAAAElFTkSuQmCC","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABVElEQVR42mNgGAWjYBSMglEwwICRkIL/////hytmZGQk1mCYPlL04DIEjpEdQ6w+QnpYiDHw/h41BoatDAyMjIwMxDiCFE8zEaNI0eUWxCGFagyMjIwEMSmAhdRouV+ohlPu8HNbODtuxVzqhcD9PWpEGWYreRjOXhSRTD0H0BIMXQco9N1kUOy/hVOeqmkAHdjZqTFQUr4QVRL+////P7Il+FI/SpbtvwVPgLBQ+P//P84SkZA3/jMwMDASWwLiKJQYoZ5hJKkcsP1f/v8QQwcDAwPDf1l+QYqKc3z1AVGVkSy/IMNHNxmSLeff9YTh8cf38OCXXe/z/3HgFkayE6HBam8GgWgFBgYGBjhNjBwMoFtOVggYrPZmuBC6FcWiD0sfoDiEgYGB4ULoVowQGPAooKgy4t/1hCYlIQsxrRpVUXGKLMGXExiJbY5RXOLhcMCAV0YAOuqTgiS6rLcAAAAASUVORK5CYII=","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABWUlEQVR42mNgGAWjYBSMglEwwICRkIL/////hytmZGQk1mCYPkJ6WAgZ4qSigcInxhH/////L8svSJQeFmJ8M2/mfwaGrQwMTioaKCGCC8AspzgKkENgnh/EqRNuLXcfv0SQ+zxx/cMFIcASmj44Q6Aw8+D4eyqbWuJMo+J6CggAthKHoaz27yCqecAWoKh6wDbua8YbOe+wikft2IuUeawkGO5nZ0aA6OdGoRz6BZtSkL0Qghf6kcGiv23GBZFJKPkBEJZESdwVFb/D3MMuQC5WJZd7/Of6BCw/V/+/xBDB8klG6kFEdHl+kc3GZIt59/1hKADSM4FBqu94WyBaAUGgWgFrOLEApJygUC0AsOF0K0MBqu9GR5suMrwYekDuNyF0K0MAtEKDAoB2gwXQrdStz1AyyhgIcUwWgCCDRIGBgYGVVFxiizB1yhhJMYBVGn74XDAgFdGAAxEyzHDM+lFAAAAAElFTkSuQmCC"];

  try{
    var badge=document.querySelector('.vpn-badge[data-vpn]');
    if(badge){
      var wrap=badge.parentNode && badge.parentNode.classList &&
        badge.parentNode.classList.contains('vpn-status-wrap') ? badge.parentNode : null;

      if(!wrap){
        wrap=document.createElement('div');
        wrap.className='vpn-status-wrap';
        badge.parentNode.insertBefore(wrap,badge);
        wrap.appendChild(badge);
      }

      // Remove every legacy/custom kitty implementation before creating one
      // authoritative element.
      var oldCats=wrap.querySelectorAll(
        '.vpn-cat,.vpn-cat-window,.vpn-kitty-host,[data-vpn-kitty]'
      );
      for(var oc=0;oc<oldCats.length;oc++) oldCats[oc].remove();

      wrap.style.setProperty('display','flex','important');
      wrap.style.setProperty('align-items','center','important');
      wrap.style.setProperty('justify-content','center','important');
      wrap.style.setProperty('gap','10px','important');
      wrap.style.setProperty('width','100%','important');
      wrap.style.setProperty('min-height','54px','important');
      wrap.style.setProperty('margin-top','8px','important');
      wrap.style.setProperty('position','relative','important');
      wrap.style.setProperty('z-index','20','important');

      var host=document.createElement('span');
      host.className='vpn-kitty-host';
      host.setAttribute('data-vpn-kitty','1');
      host.setAttribute('aria-hidden','true');
      host.style.setProperty('display','inline-flex','important');
      host.style.setProperty('align-items','center','important');
      host.style.setProperty('justify-content','center','important');
      host.style.setProperty('width','48px','important');
      host.style.setProperty('height','48px','important');
      host.style.setProperty('min-width','48px','important');
      host.style.setProperty('min-height','48px','important');
      host.style.setProperty('flex','0 0 48px','important');
      host.style.setProperty('overflow','visible','important');
      host.style.setProperty('position','relative','important');
      host.style.setProperty('z-index','21','important');

      var cat=document.createElement('img');
      cat.alt='';
      cat.draggable=false;
      cat.decoding='sync';
      cat.setAttribute('data-vpn-kitty-frame','1');

      // Beat all site-wide image rules, including .card img{height:auto}.
      cat.style.setProperty('display','block','important');
      cat.style.setProperty('width','48px','important');
      cat.style.setProperty('height','48px','important');
      cat.style.setProperty('min-width','48px','important');
      cat.style.setProperty('min-height','48px','important');
      cat.style.setProperty('max-width','48px','important');
      cat.style.setProperty('max-height','48px','important');
      cat.style.setProperty('object-fit','contain','important');
      cat.style.setProperty('margin','0','important');
      cat.style.setProperty('padding','0','important');
      cat.style.setProperty('border','0','important');
      cat.style.setProperty('transform','none','important');
      cat.style.setProperty('image-rendering','pixelated','important');
      cat.style.setProperty('opacity','1','important');
      cat.style.setProperty('visibility','visible','important');

      host.appendChild(cat);
      wrap.insertBefore(host,badge);

      var vpnOn=badge.getAttribute('data-vpn')==='1';
      var phase=vpnOn?'idle':'sad';
      var frame=0;
      var sadLoops=0;
      var last=0;

      function currentFrames(){
        if(phase==='sad') return KITTY_SAD;
        if(phase==='hack') return KITTY_HACK;
        return KITTY_IDLE;
      }

      // Set a frame immediately; no dependency on an image load event.
      cat.src=currentFrames()[0];

      function tick(now){
        if(!host.isConnected) return;
        if(!last || now-last>=115){
          last=now;
          var list=currentFrames();
          cat.src=list[frame];
          frame++;
          if(frame>=list.length){
            frame=0;
            if(phase==='sad'){
              sadLoops++;
              if(sadLoops>=2) phase='hack';
            }
          }
        }
        requestAnimationFrame(tick);
      }

      if(!(window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
        requestAnimationFrame(tick);
      }

      // Diagnostic breadcrumb available from Safari/Chrome console:
      // document.querySelector('[data-vpn-kitty]').dataset.kittyStatus
      host.dataset.kittyStatus='embedded-frames-active';
    }
  }catch(e){
    console.error('VPN kitty init failed',e);
  }

  // Autoplay the featured project demo wherever browser policy permits.
  try{
    var video=document.querySelector('.project-featured video');
    if(video){
      video.muted=true;
      video.defaultMuted=true;
      video.autoplay=true;
      video.loop=true;
      video.playsInline=true;
      video.setAttribute('muted','');
      video.setAttribute('autoplay','');
      video.setAttribute('loop','');
      video.setAttribute('playsinline','');
      var tryPlay=function(){
        var p=video.play();
        if(p&&p.catch)p.catch(function(){});
      };
      if(video.readyState>=2) tryPlay();
      else video.addEventListener('canplay',tryPlay,{once:true});
      document.addEventListener('visibilitychange',function(){
        if(!document.hidden)tryPlay();
      });
    }
  }catch(e){}
})();
