<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * @package    qtype
 * @subpackage musicscale
 * @copyright  2013 Jay Huber (jhuber@colum.edu)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
* musicscale question editing form definition.
*
* @copyright  2013 Jay Huber (jhuber@colum.edu)
* @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
*/

function xmldb_qtype_musicscale_upgrade($oldversion) { 
  global $CFG, $DB;

  $dbman = $DB->get_manager();
  
  if ($oldversion < 2013072600) {
    //add the force scale role to the question
    $table = new xmldb_table('question_musicscale');
    $field = new xmldb_field('forceclef', XMLDB_TYPE_CHAR, '10', null, XMLDB_NOTNULL, null, null, 'orignoteregister');

    if (!$dbman->field_exists($table, $field)) {
        $dbman->add_field($table, $field);
    }

    //fixing the answers on the bass clef - transposition from flash to vexflow
    $question_musicscales = $DB->get_records('question_musicscale',array());

    foreach ($question_musicscales as $question_musicscale) {
      //find the questions ids in mdl_question_answers and then rework them
      $orignoteregister = $question_musicscale->orignoteregister;
      $orignoteletter = $question_musicscale->orignoteletter;
      $orignoteaccidental = $question_musicscale->orignoteaccidental;
      $includeks = $question_musicscale->includeks;
      $modescale = $question_musicscale->modescale;
      
      $adjust = array();
      if ($includeks == "y") {
        if ($modescale != "ma") {
          $modescale = "mi";
        }
        $chknote = $modescale.$orignoteletter.$orignoteaccidental;
        $adjust = musicscale_getadjust($chknote);
      }
      
      $adjust_register = 0;

      //adjust everything on the Bass Clef by one register
      if (($orignoteregister < "3") || (($orignoteregister == "3") && (in_array($orignoteletter,array("C","D","E","F"))))) {
        //all notes on the bass clef need to be adjusted by one register
        $orignoteregister = strtr($orignoteregister, array ('2' => '1', '3' => '2', '4' => '3', '5' => '4'));
        $question_musicscale->orignoteregister = $orignoteregister;
        $adjust_register = 1;
        $DB->update_record('question_musicscale', $question_musicscale);
      }
      
      $question_answers = $DB->get_records("question_answers",array('question'=>$question_musicscale->questionid));
      foreach ($question_answers as $question_answer) {
        $answer = $question_answer->answer;
        
        $answer = strtr($answer, array ('x' => '##'));
        $before = $answer;

        if ($adjust_register == 1) {
          $answer = strtr($answer, array ('2' => '1', '3' => '2', '4' => '3', '5' => '4'));
        }

        if ($includeks == "y") {
          $answer = musicscale_adjustnote($adjust, $answer);
        }
        $question_answer->answer = $answer;
        $DB->update_record('question_answers', $question_answer);
      }

      $question_attempts = $DB->get_records("question_attempts",array('questionid'=>$question_musicscale->questionid));
      foreach ($question_attempts as &$question_attempt) {
        $responsesummary = $question_attempt->responsesummary;
        $rightanswer = $question_attempt->rightanswer;
        if ($adjust_register == 1) {
          $responsesummary = strtr($responsesummary, array ('2' => '1', '3' => '2', '4' => '3', '5' => '4'));
          $rightanswer = strtr($rightanswer, array ('2' => '1', '3' => '2', '4' => '3', '5' => '4'));
        }
        
        $responsesummary = musicscale_adjustnote($adjust, $responsesummary);
        $rightanswer = musicscale_adjustnote($adjust, $rightanswer);

        $question_attempt->responsesummary = $responsesummary;
        $question_attempt->rightanswer = $rightanswer;

        $DB->update_record('question_attempts', $question_attempt);

        $question_attempt_steps = $DB->get_records("question_attempt_steps",array('questionattemptid'=>$question_attempt->id,'state'=>'complete'));
        foreach ($question_attempt_steps as &$question_attempt_step) {
          $question_attempt_step_datas = $DB->get_records("question_attempt_step_data",array('attemptstepid'=>$question_attempt_step->id));
          foreach ($question_attempt_step_datas as &$question_attempt_step_data) {
            $qasd_answer = $question_attempt_step_data->value;
            if ($adjust_register == 1) {
              $qasd_answer = strtr($qasd_answer, array ('2' => '1', '3' => '2', '4' => '3', '5' => '4'));
            }
            $qasd_answer = musicscale_adjustnote($adjust, $qasd_answer);
            $question_attempt_step_data->value = $qasd_answer;
            $DB->update_record('question_attempt_step_data', $question_attempt_step_data);
          }
        }
      }
    }
  }

  return true;
}

function musicscale_adjustnote($adjust, $answers) {
    if ($adjust != "") {
        $new_answer = array();
        $answers = explode(",",$answers);
        
        foreach ($answers as &$answer) {
            if ($answer != "") {
                $ltr = substr($answer,0,1);
                $reg = $answer[strlen($answer)-1];
                $acc = str_replace(array($ltr,$reg),array("",""),$answer);
                $new_note = $answer;
                
                foreach ($adjust as &$adj) {
                    if ($ltr == $adj) {
                        if ((($acc != "") && ($acc == "##")) || (($acc != "") && ($acc == "bb"))) {
                            $new_note = $ltr.$acc.$reg;
                        } else if ($acc != "") {
                            $new_note = $ltr.$reg;
                        } else {
                            $new_note = $ltr."n".$reg;
                        }
                        break;
                    }
                }
                array_push($new_answer,$new_note);
            } else {
                array_push($new_answer,"");
            }
        }
        return implode(',', $new_answer);
    }
    return $answers;
}

function musicscale_getadjust($chknote) {
    if (($chknote == "maG") || ($chknote == "miE")) {
      return array("F");
    } else if (($chknote == "maD") || ($chknote == "miB")) {
      return array("F","C");
    } else if (($chknote == "maA") || ($chknote == "miF#")) {
      return array("F","C","G");
    } else if (($chknote == "maE") || ($chknote == "miC#")) {
      return array("F","C","G","D");
    } else if (($chknote == "maB") || ($chknote == "miG#")) {
      return array("F","C","G","D","A");
    } else if (($chknote == "maF#") || ($chknote == "miD#")) {
      return array("F","C","G","D","A","E");
    } else if (($chknote == "maC#") || ($chknote == "miA#")) {
      return array("F","C","G","D","A","E","B");
    } else if (($chknote == "maF") || ($chknote == "miD")) {
      return array("B");
    } else if (($chknote == "maBb") || ($chknote == "miG")) {
      return array("B","E");
    } else if (($chknote == "maEb") || ($chknote == "miC")) {
      return array("B","E","A");
    } else if (($chknote == "maAb") || ($chknote == "miF")) {
      return array("B","E","A","D");
    } else if (($chknote == "maDb") || ($chknote == "miBb")) {
      return array("B","E","A","D","G");
    } else if (($chknote == "maGb") || ($chknote == "miEb")) {
      return array("B","E","A","D","G","C");
    } else if (($chknote == "maCb") || ($chknote == "miAb")) {
      return array("B","E","A","D","G","C","F");
    }
}
