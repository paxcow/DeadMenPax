{OVERALL_GAME_HEADER}

<!-- 
--------
-- BGA framework: Gregory Isabelli & Emmanuel Colin & BoardGameArena
-- deadmenpax implementation : © Andrea "Paxcow" Vitagliano <andrea.vitagliano@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-------

    deadmenpax_deadmenpax.tpl
    
    This is the HTML template of your game.
    
    Everything you are writing in this file will be displayed in the HTML page of your game user interface,
    in the "main game zone" of the screen.
    
    You can use in this template:
    _ variables, with the format {MY_VARIABLE_ELEMENT}.
    _ HTML block, with the BEGIN/END format
    
    See your "view" PHP file to check how to set variables and control blocks
    
    Please REMOVE this comment before publishing your game on BGA
-->


This is your game interface. You can edit this HTML in your ".tpl" file.
<svg width="0" height="0">
	<filter id="filter">
		<feTurbulence type="fractalNoise" baseFrequency=".02" numOctaves="8" seed="42" />
		<feDisplacementMap in="SourceGraphic" scale="10" />
	</filter>
	<filter id="filter2">
		<feTurbulence type="fractalNoise" baseFrequency=".01" numOctaves="10" seed="42" />
		<feDisplacementMap in="SourceGraphic" scale="80" />
	</filter>
</svg>

<script type="text/javascript">

// Javascript HTML templates

/*
// Example:
var jstpl_some_game_item='<div class="my_game_item" id="my_game_item_${MY_ITEM_ID}"></div>';

*/

</script>  

{OVERALL_GAME_FOOTER}
