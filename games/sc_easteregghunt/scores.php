<?php
/**
 * return highscores
 *
 * Outputs top ten scores in XML format
 * Two *optional* params: initials + order
 * @author: ralphandco.com
 */
// INCLUDES --------------------------------------------------------------------
require_once("config.php");

// INPUT -----------------------------------------------------------------------
$maxlimit = 10;
$initials = (isset($_POST['initials'])) ? strtoupper(substr($_POST['initials'], 0, 3)) : ''; //max 3 chars - convert to uppercase
$order = (isset($_POST['order'])) ? strtoupper(substr($_POST['order'], 0, 5)) : 'LARGE'; //max 5 chars - convert to uppercase - valid values: LARGE or SMALL
$userrow = null;

// PROCESS ---------------------------------------------------------------------	
$sqlOrder = ($order != 'LARGE') ? 'ASC' : 'DESC'; //if order param is LARGE then order DESC, otherwise ASC	

if ($initials != '') { 
	//include specified user in highscores
	$sqlQuery = 'SELECT var_initials, var_score, int_score FROM tbl_scores WHERE var_initials = ? ORDER BY int_score '.$sqlOrder.' LIMIT 1';		
	$sth = $pdo->prepare($sqlQuery);
	$sth->execute(array($initials));
	$row = $sth->fetch(PDO::FETCH_ASSOC);
	if ($row) {
		$userscore = $row['var_score']; //for display
		$userintscore = $row['int_score']; //for ordering
		$userinitials = $row['var_initials']; 
		$userrow = '<entry score="'.$userscore.'" initials="'.$userinitials.'" activeuser="1" rank="USERRANK" />'."\n";
		
		$compareOp = ($sqlOrder == 'DESC') ? '>' : '<'; //if highscores desc then count score > userscore
		
		$sqlQuery = 'SELECT var_initials, var_score, int_score, 
				(SELECT count(int_key)+1 FROM tbl_scores WHERE int_score '.$compareOp.' '.$userintscore.') as userposition 
				FROM tbl_scores ORDER BY int_score '.$sqlOrder.' LIMIT '.$maxlimit;
	} else {
		$sqlQuery = 'SELECT var_initials, var_score, int_score, 0 as userposition FROM tbl_scores ORDER BY int_score '.$sqlOrder.' LIMIT '.$maxlimit;
	}
	
} else {
	$sqlQuery = 'SELECT var_initials, var_score, int_score, 0 as userposition FROM tbl_scores ORDER BY int_score '.$sqlOrder.' LIMIT '.$maxlimit;
}
$sth = $pdo->prepare($sqlQuery);
$sth->execute();
$rows = $sth->fetchAll(PDO::FETCH_ASSOC);	

$toprows = '';
$rankCount = 1;
foreach($rows as $row) {
	if ($toprows == '') {
		$userposition = $row['userposition'];
		if ($userposition <= 10) {
			$userrow = ''; //clear var since they will be included in top ten loop already
		} else {
			$userrow = str_replace('USERRANK', $userposition, $userrow); //replace placeholder with actual user position 
		}
	}
	$activeuser = ($initials !='' and $row['var_initials'] == $initials) ? 1 : 0;
	$toprows .= '<entry score="'.$row['var_score'].'" initials="'.htmlentities($row['var_initials']).'" activeuser="'.$activeuser.'" rank="'.$rankCount.'" />'."\n";
	$rankCount++;
}
$pdo = null; //close db connection

// OUTPUT ----------------------------------------------------------------------
header('Content-Type: text/xml;charset=utf-8');
echo '<highscores>'."\n";
echo $toprows.$userrow;
echo '</highscores>';
?>