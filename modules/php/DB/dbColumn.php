<?php

namespace Bga\Games\deadmenpax\DB;


#[\Attribute]
class dbColumn
{
    public string $name;
    public function __construct($name)
    {

        $this->name = $name;
    }
}