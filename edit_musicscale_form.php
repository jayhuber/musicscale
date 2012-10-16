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
 * Defines the editing form for the music scale question type.
 *
 * @package     qtype
 * @subpackage  musicscale
 * @copyright   &copy; 2009 Eric Brisson for Moodle 1.x and Flash Component
 * @author      ebrisson at winona.edu
 * @copyright   &copy; 2012 Jay Huber for Moodle 2.x
 * @author      jhuber at colum.edu
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
*/

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/question/type/edit_question_form.php');
//require_once($CFG->dirroot . '/question/type/musicscale/edit_form_base.php');

/**
 * Scale editing form definition.
 * 
*/

class qtype_musicscale_edit_form extends question_edit_form {
    const MAX_GROUPS = 8;

    /** @var array of HTML tags allowed in choices / drag boxes. */
    protected $allowedhtmltags = array(
        'sub',
        'sup',
        'b',
        'i',
        'em',
        'strong'
    );

    /** @var string regex to match HTML open tags. */
    private $htmltstarttagsandattributes = '/<\s*\w.*?>/';

    /** @var string regex to match HTML close tags or br. */
    private $htmltclosetags = '~<\s*/\s*\w\s*.*?>|<\s*br\s*>~';

    /** @var string regex to select text like [[cat]] (including the square brackets). */
    private $squarebracketsregex = '/\[\[[^]]*?\]\]/';

    /**
     * definition_inner adds all specific fields to the form.
     * @param object $mform (the form being built).
     */
    protected function definition_inner($mform) {
        global $CFG;

        $mform->addElement('select', 'includeks', get_string('includeKS','qtype_musicscale'), 
                            array( "y"  => get_string('yes', 'qtype_musicscale'),
                                   "n"  => get_string('no', 'qtype_musicscale')
                                  ));

		$mform->addHelpButton('includeks', 'includeKS', 'qtype_musicscale');

        $mform->addElement('select', 'modescale', get_string('modeScale','qtype_musicscale'), 
                           array( "ma"  => get_string('modeScale_major','qtype_musicscale'),
                                  "nm"  => get_string('modeScale_natural_minor','qtype_musicscale'),
                                  "hm"  => get_string('modeScale_harmonic_minor','qtype_musicscale'),
                                  "mm"  => get_string('modeScale_melodic_minor','qtype_musicscale'),
                                 ));

//		$mform->addHelpButton('modescale', 'modescale', 'qtype_musicscale');

        $mform->addElement('select', 'orignoteletter', 
            get_string('orignoteletter','qtype_musicscale'),
            array( "C"  => get_string('C','qtype_musicscale'),
            "D"  => get_string('D','qtype_musicscale'),
            "E"  => get_string('E','qtype_musicscale'),
		    "F"  => get_string('F','qtype_musicscale'),
		    "G"  => get_string('G','qtype_musicscale'),
		    "A"  => get_string('A','qtype_musicscale'),
		    "B"  => get_string('B','qtype_musicscale'),
		    ));

		$mform->addHelpButton('orignoteletter', 'orignoteletter', 'qtype_musicscale');

        $mform->addElement('select', 'orignoteaccidental', 
            get_string('orignoteaccidental','qtype_musicscale'),
            array( ""  => "&#9838",
            "#"  => "&#9839",
            "b"  => "&#9837",
            ));

//		$mform->addHelpButton('orignoteaccidental', 'orignoteaccidental', 'qtype_musicscale');

        $mform->addElement('select', 'orignoteregister', get_string('orignoteregister','qtype_musicscale'), 
                           array( "2"  => "2",
                                  "3"  => "3",
                                  "4"  => "4",
                                  "5"  => "5",
                                 ));

		$mform->addHelpButton('orignoteregister', 'orignoteregister', 'qtype_musicscale');

		$this->add_per_answer_fields($mform, get_string('answerno', 'qtype_musicscale', '{no}'),
		        	question_bank::fraction_options(), 1, 1);
		
		//this adds the hint options
		$this->add_interactive_settings();	
    }

    public function validation($data, $files) {
        $errors = parent::validation($data, $files);

        // Make sure the selected key exists
        if (!(
            (
            ($data['modescale']=="ma") &&
            (
            (($data['orignoteletter']=="C") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="G") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="D") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="A") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="E") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="B") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="F") && ($data['orignoteaccidental']=="#")) ||
            (($data['orignoteletter']=="C") && ($data['orignoteaccidental']=="#")) ||
            (($data['orignoteletter']=="F") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="B") && ($data['orignoteaccidental']=="b")) ||
            (($data['orignoteletter']=="E") && ($data['orignoteaccidental']=="b")) ||
            (($data['orignoteletter']=="A") && ($data['orignoteaccidental']=="b")) ||
            (($data['orignoteletter']=="D") && ($data['orignoteaccidental']=="b")) ||
            (($data['orignoteletter']=="G") && ($data['orignoteaccidental']=="b")) ||
            (($data['orignoteletter']=="C") && ($data['orignoteaccidental']=="b")) 
            )
            ||
            (
            ($data['modescale']=="nm" || $data['modescale']=="hm" || $data['modescale']=="mm") &&
            (
            (($data['orignoteletter']=="A") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="E") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="B") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="F") && ($data['orignoteaccidental']=="#")) ||
            (($data['orignoteletter']=="C") && ($data['orignoteaccidental']=="#")) ||
            (($data['orignoteletter']=="G") && ($data['orignoteaccidental']=="#")) ||
            (($data['orignoteletter']=="D") && ($data['orignoteaccidental']=="#")) ||
            (($data['orignoteletter']=="A") && ($data['orignoteaccidental']=="#")) ||
            (($data['orignoteletter']=="D") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="G") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="C") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="F") && ($data['orignoteaccidental']=="")) ||
            (($data['orignoteletter']=="B") && ($data['orignoteaccidental']=="b")) ||
            (($data['orignoteletter']=="E") && ($data['orignoteaccidental']=="b")) ||
            (($data['orignoteletter']=="A") && ($data['orignoteaccidental']=="b")) 
            ))))
           ) {
            $errors['orignoteletter']=get_string('nonexistentkey','qtype_musicscale');
        }

        if ($data['orignoteletter']=="B" && $data['orignoteregister']=="5") {
            $errors['orignoteregister']=get_string('tonic_too_high_for_register','qtype_musicscale');
        }

        $answers = $data['answer'];
        $answercount = 0;
        $maxgrade = false;
        foreach ($answers as $key => $answer) {
            $trimmedanswer = trim($answer);
            if ($trimmedanswer !== ''){
                $answercount++;
                if ($data['fraction'][$key] == 1) {
                    $maxgrade = true;
                }
            } else if ($data['fraction'][$key] != 0 || !html_is_blank($data['feedback'][$key]['text'])) {
                $errors["answer[$key]"] = get_string('answermustbegiven', 'qtype_shortanswer');
                $answercount++;
            }
        }

        if ($answercount==0){
            $errors['answer[0]'] = get_string('notenoughanswers', 'question', 1);
        }
        if ($maxgrade == false) {
            $errors['fraction[0]'] = get_string('fractionsnomax', 'question');
        }

        return $errors;
    }

    protected function data_preprocessing($question) {
        $question = parent::data_preprocessing($question);
        $question = $this->data_preprocessing_answers($question);
        $question = $this->data_preprocessing_hints($question);

        return $question;
    }

    public function qtype() {
        return 'musicscale';
    }
}
