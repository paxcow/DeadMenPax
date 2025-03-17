
define([
  "dojo",
  "dojo/_base/declare",
  "ebg/core/gamegui",
  "ebg/counter",
  "./modules/js/scrollmapWithZoom",
  "./modules/js/bga-cards"
], function (dojo, declare) {
  declare("bgagame.deadmenpax", ebg.core.gamegui, new DeadMenPax());
});
