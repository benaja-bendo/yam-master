// import { interpret, spawnChild } from 'xstate';
// import { gameMachine } from '../machines/gameMachine';
// import { botMachine, BotContext } from '../machines/botMachine';

// export class BotService {
//   private service = interpret(
//     gameMachine.withConfig({
//       services: {
//         // Correspond à l'invocation du bot dans gameMachine.invoke.src === 'bot'
//         bot: (ctx) => {
//           // On bâtit le contexte complet attendu par botMachine
//           const botContext: BotContext = {
//             board: ctx.board,
//             diceCount: ctx.diceCount,
//             rollsLeft: 3,
//             dice: [],
//             keptDice: [],
//             botDifficulty: ctx.botDifficulty ?? 'easy',
//           };
//           // On spawn l'acteur bot et on auto-forward les événements
//           return spawn(
//             botMachine.withContext(botContext),
//             { name: 'bot', autoForward: true }
//           );
//         },
//       },
//     })
//   ).start();

//   constructor() {
//     // On écoute une seule fois tous les événements pour capturer BOT_MOVE
//     this.service.onEvent((evt) => {
//       if (evt.type === 'BOT_MOVE') {
//         // Ici vous forwardez evt.combination et evt.cell vers votre websocket ou controller
//         // ex. this.websocket.send(JSON.stringify(evt));
//       }
//     });
//   }

//   /**
//    * Démarre une partie PVB en envoyant l'événement à gameMachine.
//    * gameMachine doit, dans son état 'pvb', invoquer le service 'bot'.
//    */
//   startPvb(playerId: string, channelId: string) {
//     this.service.send({
//       type: 'START_GAME',
//       mode: 'pvb',
//       playerId,
//       channelId,
//       botDifficulty: 'easy',
//     });
//   }
// }
