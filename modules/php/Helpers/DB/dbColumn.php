<?php

namespace BGA\Games\DeadMenPax;


#[\Attribute]
class dbColumn
{
    public string $name;
    public function __construct($name)
    {

        $this->name = $name;
    }
}