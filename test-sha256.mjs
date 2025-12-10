
import { SHA256 } from './src/utils/sha256';

const password = 'HWLP3BnktMl2Yv1';
const hash = SHA256(password);
console.log('Our SHA256 result:', hash);
console.log('Expected (from Insomnia): 2D2FCF34EC3639F6D2C605678143EBE1FF0E2405D76125930FB19A2D70B4D035');
console.log('Match:', hash.toUpperCase() === '2D2FCF34EC3639F6D2C605678143EBE1FF0E2405D76125930FB19A2D70B4D035');
