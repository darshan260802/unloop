export type GameId = 'pocket-post' | 'stencil-studio' | 'little-harbour' | 'orbit-garden';
export type SessionChoice = GameId | 'random';

export interface GameCard {
  readonly id: GameId;
  readonly name: string;
  readonly eyebrow: string;
  readonly description: string;
  readonly accent: 'lilac' | 'mint' | 'peach' | 'sky';
  readonly symbol: string;
}

export const GAME_CARDS: readonly GameCard[] = [
  {id: 'pocket-post', name: 'Number Trail', eyebrow: 'Find the route', description: 'Connect numbered checkpoints. Fill every square.', accent: 'peach', symbol: '↗'},
  {id: 'stencil-studio', name: 'Stencil Studio', eyebrow: 'Layer a picture', description: 'Rotate simple masks to make a postcard.', accent: 'lilac', symbol: '✦'},
  {id: 'little-harbour', name: 'Little Harbour', eyebrow: 'Set the channels', description: 'Turn junctions and welcome every boat.', accent: 'sky', symbol: '≈'},
  {id: 'orbit-garden', name: 'Orbit Garden', eyebrow: 'Connect the flow', description: 'Rotate rings until every flower drinks.', accent: 'mint', symbol: '◎'},
];
