<?php
/**
 * App config
 *
 * Sets global app environment and defines constants
 * @author: ralphandco.com
 */
 
//ini_set("display_errors", "1"); 
//error_reporting(E_ERROR | E_WARNING | E_PARSE); 
ini_set("display_errors","0");
error_reporting(0); 
  
// TIME ZONE -------------------------------------------------------------------
$defaultTZ = 'UTC';
date_default_timezone_set($defaultTZ);

// DATABASE --------------------------------------------------------------------
DEFINE('DB_HOST', 'localhost');
DEFINE('DB_USERNAME', 'root');
DEFINE('DB_PASSWORD', 'root');
DEFINE('DB_DATABASE', 'db_nickgame'); 

try {
    $dbHost = DB_HOST;
    $dbName = DB_DATABASE;
    $pdo = new PDO("mysql:host=$dbHost;dbname=$dbName;charset=utf8", DB_USERNAME, DB_PASSWORD);
    //$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
	//echo $e->getMessage();
    die('Connection unavailable');
}  

// CONSTANTS -------------------------------------------------------------------
DEFINE('SCOREMODE_NUMERIC', 0);
DEFINE('SCOREMODE_TIME', 1);


// SESSION ---------------------------------------------------------------------
session_start();

?>