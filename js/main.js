
import {SlideManager} from './slide_manager.js';
import {Navigator} from './navigator.js';
import {Database} from './database.js'



let database = new Database();
let navigator = new Navigator();
let slide_manager = new SlideManager(database, 
    navigator.pushSlide.bind(navigator));
await slide_manager.loadHomeSlide();