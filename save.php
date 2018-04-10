<?php

	$action = $_POST["action"];
	$userId = $_POST["userid"];
	$dumpDatabase = $_POST["dumpdatabase"];

	switch($action){
		case "save":
			$myfile = fopen("dump/" . $userId . ".txt", "w") or die("Unable to open file!");
			fwrite($myfile, $dumpDatabase);
			fclose($myfile);
		break;
		case "read":
			$myfile = fopen("dump/" . $userId . ".txt", "r") or die("Unable to open file!");
			echo fread($myfile, filesize("dump/" . $userId . ".txt"));
			fclose($myfile);
		break;
	}
	
?>