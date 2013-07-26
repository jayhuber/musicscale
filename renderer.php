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
 * Generates the output for musicscale questions.
 *
 * @copyright  2013 Jay Huber (jhuber@colum.edu)
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
 
class qtype_musicscale_renderer extends qtype_renderer {

    public function formulation_and_controls(question_attempt $qa,
 	       question_display_options $options) {

		global $PAGE, $CFG;
		$output = "";

        $question = $qa->get_question();
		$inputname = $qa->get_qt_field_name('answer');
		$scriptname = preg_replace('/:[0-9]*_answer/', '', $inputname);
		
		$questiontext = $question->format_questiontext($qa);
		$response = $qa->get_last_qt_var('answer', '');

		$output .= html_writer::empty_tag('input', array(
			'id' => $inputname,
			'name' => $inputname,
			'type' => 'hidden',
			'value' => $response));

        $stave_size = 450;
        $questiontext1 = get_string($question->orignoteletter, 'qtype_musicscale') ;
        if ($question->modescale == "ma") {
          $questiontext1 .= " ".get_string('modescale_major', 'qtype_musicscale');
        } elseif ($question->modescale == "nm") {
          $questiontext1 .= " ".get_string('modescale_natural_minor', 'qtype_musicscale');
        } elseif ($question->modescale == "hm") {
          $questiontext1 .= " ".get_string('modescale_harmonic_minor', 'qtype_musicscale');
        } elseif ($question->modescale == "mm") {
          $questiontext1 .= " ".get_string('modescale_melodic_minor', 'qtype_musicscale');
          $stave_size = 800;
        }

		$output .= html_writer::tag('div', $questiontext.$questiontext1, array('class' => 'qtext'));
		$output .= html_writer::script('', $CFG->wwwroot.'/question/type/musicscale/js/jquery-1.6.2.min.js');
		$output .= html_writer::script('', $CFG->wwwroot.'/question/type/musicscale/js/vexflow.js');

		//Create Popup Menu
		$menu_items  = html_writer::tag('img', "", array('id' => 'cm_clear', 'src' => $CFG->wwwroot.'/question/type/musicscale/images/empty.png'));
		$menu_items .= html_writer::tag('img', "", array('id' => 'cm_flat', 'src' => $CFG->wwwroot.'/question/type/musicscale/images/s_flat.png'));
		$menu_items .= html_writer::tag('img', "", array('id' => 'cm_sharp', 'src' => $CFG->wwwroot.'/question/type/musicscale/images/s_sharp.png'));
		$menu_items .= html_writer::tag('img', "", array('id' => 'cm_natural', 'src' => $CFG->wwwroot.'/question/type/musicscale/images/s_natural.png'));
		$menu_items .= html_writer::tag('img', "", array('id' => 'cm_double_flat', 'src' => $CFG->wwwroot.'/question/type/musicscale/images/s_double_flat.png'));
		$menu_items .= html_writer::tag('img', "", array('id' => 'cm_double_sharp', 'src' => $CFG->wwwroot.'/question/type/musicscale/images/s_double_sharp.png'));
		$add_items  = html_writer::tag('span', "Cancel", array('id' => 'cancel', 'class' => 'button'));
		$add_items .= html_writer::tag('span', "Delete", array('id' => 'delete', 'class' => 'button'));
		$menu_items .= html_writer::tag('div', $add_items, array());
		$output .= html_writer::tag('div', $menu_items, array('id' => 'context_menu'));

		$output .= html_writer::tag('canvas', '', array('id' => 'score', 'class' => 'music', 'width' => $stave_size+50, 'height' => 150));

		$output .= isset($state->responses['']) ? $state->responses[''] : '';
		$q_setup = array(
			'type' => 'scale',
            'letter' => $question->orignoteletter,
            'accidental' => $question->orignoteaccidental,
            'register' => $question->orignoteregister,
            'includeks' => $question->includeks,
            'modescale' => $question->modescale,
            'forceclef' => $question->forceclef,
            'answer' => $inputname
		);

		$output .= html_writer::script('q_setup = '.json_encode($q_setup).';', '');
		$output .= html_writer::tag('div', get_string('instructions', 'qtype_musicscale'), array('id' => 'instructions'));
		$output .= html_writer::script('', $CFG->wwwroot.'/question/type/musicscale/js/music_functions.js');
		$output .= html_writer::script('', $CFG->wwwroot.'/question/type/musicscale/js/scale_question.js');

//		$swfobject = 'swfobject.embedSWF("'.$CFG->wwwroot.'/question/type/musicscale/scales.swf", "flashcontent_'.$question->id.'", "1050", "320", "8.0.0", false, flashvars_'.$question->id.');';
//		$output .= html_writer::script($swfobject, '');

//		$setresponse = 'function setResponse_'.$scriptname.'_'.$question->id.'(str) { document.getElementById("'.$inputname.'").value = str; }';
//		$output .= html_writer::script($setresponse, '');

		return $output;
    }

	public function specific_feedback(question_attempt $qa) {
	    $question = $qa->get_question();
	    $response = $qa->get_last_qt_var('answer', '');

	    if ($response) {
	        return $question->format_text($question->feedback, $question->feedbackformat,
	                $qa, 'question', 'answerfeedback', $question->rightanswer);
	    } 
	}

    public function correct_response(question_attempt $qa) {
        $question = $qa->get_question();
        $response = $qa->get_last_qt_var('answer', '');
        $answer = strtolower($response);

        $stave_size = 450;
        if ($question->modescale == "mm") {
            $stave_size = 800;
        }

        if (substr($answer, -1, 1) == ',') {
            $answer = substr($answer, 0, -1);
        }

        $output = "";
        $correct = 0;
        $out_answer = "";
        foreach ($question->answers as $a) {
            if ($answer == strtolower($a->answer)) {
                $correct = $a->fraction;
            }

            if ($out_answer != "") {
                $out_answer .= "|";
            }
            $out_answer .= strtolower($a->answer);
        }

        if ($correct > 0) {
            $output .= get_string('feedbackcorrectanswer', 'qtype_musicscale');
        } else {
            $output .= get_string('feedbackwronganswer', 'qtype_musicscale')."<br />";
            $output .= html_writer::tag('div', '', array('id' => 'answers'));
            $ac = 0;
            foreach ($question->answers as $a) {
                if ($ac != 0) {
                    $output .= "or<br />";
                } 
                $output .= html_writer::tag('canvas', '', array('id' => ('answer_'.$ac), 'class' => 'music','width' => ($stave_size+50), 'height' => 150));
                $output .= "<br />";
                $ac += 1;
            }

//            $output .= str_replace("|","<br />or<br />",$out_answer);

            $a_setup = array('type' => 'scale', 'forceclef' => $question->forceclef, 'answer' => $out_answer);
            $output .= html_writer::script('a_setup = '.json_encode($a_setup).';', '');
        }

        return $output;
    }

}