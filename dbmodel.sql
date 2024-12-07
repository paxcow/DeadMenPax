-- ------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- DeadMenPax implementation : © Andrea "Paxcow" Vitagliano <andrea.vitagliano@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
ALTER TABLE `player` 
    ADD `fatigue` INT(2) UNSIGNED NOT NULL DEFAULT 0,
    ADD `strength` INT (2) UNSIGNED NOT NULL DEFAULT 0,
    ADD `actions` INT(1) UNSIGNED NOT NULL DEFAULT 6,
    ADD `character` INT(1) NOT NULL DEFAULT -1,
    ADD `cutlass` INT(1) NOT NULL DEFAULT 0,
    ADD `pos_x` INT(2) DEFAULT 0,
    ADD `pos_y` INT(2) DEFAULT -1;
CREATE TABLE IF NOT EXISTS `rooms` (
    `room_id` int(10) unsigned NOT NULL,
    `pos_x` int(2) NOT NULL,
    `pos_y` int(2) unsigned NOT NULL,
    `orientation` int(2) NOT NULL,
    `fire_level` int(1) unsigned NOT NULL,
    `exploded` boolean NOT NULL DEFAULT FALSE,
    `unreachable` boolean NOT NULL DEFAULT FALSE,
    `keg_exploded` boolean DEFAULT NULL,
    PRIMARY KEY (`room_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
CREATE TABLE IF NOT EXISTS `characters` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(16) NOT NULL,
    `card_type_arg` int(11) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;
CREATE TABLE IF NOT EXISTS `revenge` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(16) NOT NULL,
    `card_type_arg` int(11) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;
CREATE TABLE IF NOT EXISTS `items` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(16) NOT NULL,
    `card_type_arg` int(11) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
CREATE TABLE IF NOT EXISTS `tokens` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(16) NOT NULL,
    `card_type_arg` int(11) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;
CREATE TABLE IF NOT EXISTS `tiles` (
    `card_id` int(10) unsigned NOT NULL AUTO_INCREMENT,
    `card_type` varchar(16) NOT NULL,
    `card_type_arg` int(11) NOT NULL,
    `card_location` varchar(16) NOT NULL,
    `card_location_arg` int(11) NOT NULL,
    PRIMARY KEY (`card_id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8 AUTO_INCREMENT = 1;