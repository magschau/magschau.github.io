<?php
/**
 * Save score
 *
 * Saves user initials and score (numeric or time in 00:00:00 format)
 * Two *required* params: initials + score
 * @author: ralphandco.com
 */
// INCLUDES --------------------------------------------------------------------
require_once("config.php");

// FUNCTIONS -------------------------------------------------------------------
function seconds_from_time($time) { 
    list($h, $m, $s) = explode(':', $time); 
    return ($h * 3600) + ($m * 60) + $s; 
}

// INPUT -----------------------------------------------------------------------
$bError = false;
$sDateCreate = date('Y-m-d H:i:s');
$initials = (isset($_POST['initials'])) ? strtoupper(substr(preg_replace('/[^a-zA-Z]/', '', $_POST['initials']), 0, 3)) : ''; //max 3 chars - convert to uppercase
$score = (isset($_POST['score'])) ? substr(preg_replace('/[^0-9:]/', '', $_POST['score']), 0, 8) : ''; //max 8 chars - only digits + colon sign allowed

// PROCESS ---------------------------------------------------------------------
if ($initials != '' and $score != '') {
	//required fields provided
	//check initials against swear blacklist
	$sqlQuery = 'SELECT var_badword FROM tbl_swear WHERE var_badword = ? LIMIT 1';		
	$sth = $pdo->prepare($sqlQuery);
	$sth->execute(array($initials));
	$row = $sth->fetch(PDO::FETCH_ASSOC);
	if ($row) {
		$initials = 'XXX'; //matched against bad word so replace
	}
	//check score is time format or numeric
	$scoreMode = (strpos($score, ':') !== false) ? SCOREMODE_TIME : SCOREMODE_NUMERIC; //constants defined in config.php
	$score_for_ordering = $score;
	if ($scoreMode == SCOREMODE_TIME) {
		//convert to seconds
		$score_for_ordering = seconds_from_time($score);
	} 
	//insert
	$sqlQuery = 'INSERT INTO tbl_scores (var_initials, var_score, int_score, date_createdate) VALUES (?, ?, ?, ?)';
	$sth = $pdo->prepare($sqlQuery);
	$sth->execute(array($initials, $score, $score_for_ordering, $sDateCreate));
	
} else {
	//error - missing required fields
	$bError = true;
}
$pdo = null; //close db connection

// OUTPUT ----------------------------------------------------------------------
if ($bError) {
    echo 'result=false';
} else {
    echo 'result=true'; //success
}
?>