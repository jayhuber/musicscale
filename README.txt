Readme file for the MUSICAL SCALE question type
===============================================

- @package    qtype
- @subpackage musicscale
- @copyright  2013 Jay Huber <jhuber@colum.edu>
- @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later


Version 2 Warning
-----------------
Version 2 is a complete rewrite attempting to keep as much backend intact.  You should make a full backup of any classes that use Music Scales before
proceeding with this update.  Upgrading is at your own risk.  I do believe this is a solid release and will cause you know ill effect, but, I 
may have overlooked a scenario that I didn't consider. I have spent months on this rewrite, and I hope you enjoy.

The questions, answers, and previous student answers on the bass clef had to be transposed a register lower.  
Also, if you had key signature turned on for your questions, the answers had to be transposed to how this update writes the answers.

Please report all bugs as indicated below.


Other Credits
-------
Dr. Erik Brisson <ebrisson@winona.edu> who originally made a music scale question for Moodle 1.x using the Flash player and still deserves credit!
Mohit Muthanna a.k.a. 0xFE, who started the vexflow project using html5, canvas, and jquery - and all the contributors to this project!


Description
-----------
This question type deals with musical scales. The respondent is given a note and is prompted to enter the degrees of the scale. Major scales as well as all types of minor scales (natural, harmonic and melodic) are supported, with or without a key signature. Answers are entered in a graphical user interface.

Import/Export to Moodle XMl format is supported, and a question bank is provided, including all major and minor scales, with and without a key signature.

This plugin is released under the GNU General Public License V3. 

Maintainer: Jay Huber (jhuber@colum.edu), Moodle 2.x


Installation
------------
Requirements:

1) 	Moodle 2.3.x
	The plug-in might work with previous versions of 2, but has only been tested with this version.

2) 	PHP 5: the plug-in was coded with version 5.2.9. It hasn't been tested with earlier versions of PHP.

3)	Javascript is used to for communication with the Flash input component, and must be enabled for the question type to work.

How to install:

1) Copy the "musicscale" folder into the following folder: question/type/. 
2) Load the "Notifications" page on the Moodle home page - this will create database tables used by the question type.



Code Location
-------------
You can always find the latest version at: https://github.com/jayhuber/musicscale
Moodle plugins will notify you as I update the code on Moodle.org


Bug Reports
-----------
Report all bugs on https://github.com/jayhuber/musicscale/issues


Changelog
---------
v2013090300 - release v2.3 Stable
- Fixed typo to alto language string
- Fixed issue with auto generated answer prompt not offering the accidental
- Fixed issue to alter question answers entered on the build question form to save them in uppercase.
- Found an issue in the NoteTranslate that was not passing the clef causing a drawing issue.
- Alter installation instruction in README.txt

v2013081300 - release v2.2 Stable
- Fixed missing language string for treble, bass, alto, and tenor.
- Fixed issue with reference to "score" with multiple question fix.

v2013080700 - release v2.1 Stable
- Fixed an issue with multiple questions appearing on the same page causing big failures
- Also related to that, the clef was adjusting to the last rendered question.

v2013073100 - release v2.03 Stable
- Fixed install.xml reference to next incorrect

v2013073001 - release v2.02 Stable
- Another Fix for the X Position for IE browsers

v2013073000 - release v2.01 Stable
- Fixed offsets for Firefox, IE and Safari Browsers

v2013072600 - release v2.0 Stable
- Removed the Flash Plugin and replaced with Vexflow
- All other necessary adjustment to get this program to be switched over.
- WARNING: THIS WILL TRANSPOSE ALL BASS CLEF QUESTIONS, ANSWERS AND STUDENT ANSWERS as well as questions that contain key signatures.

v2013072000 - release v1.4 Stable
- Fixed Backup/Restore capability 
- Aligned code to more closely match 2.x template and removed much unused code
- Cleaned up copyright tags

v2013071601 - release v1.3 Stable
- Fixed the score marking issue for multiple answer questions

v2013071700 - release v1.3 Stable
- Aligning Moodle version to match the other music plugins

v2013071600 - release v1.2 Stable
- Updated this readme file
- Removed import/export overrides which should fix the issue of importing/exporting data
- Fixed Multiple answers bug where only first answer is compared.
- Updated copyright dates


