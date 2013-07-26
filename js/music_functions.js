var canvases = Array();
var note_count = 0;
var stave_size = 0;
var interval_adjust = 0;
var ghost_note_type = "w";
var context_stave = "";

//var keySig = new Vex.Flow.KeySignature("F");
//keySig.addToStave(staves[0])
//staves[0].setContext(ctx).draw();

function RemoveLastEntry(obj) {
  answer = $(obj).val();
  if (answer.length > 0) {
    answer = answer.substring(0, answer.length-1);
  }
  $(obj).val(answer);
}

function RestoreFirstNote(obj) {
  f_letter = $("#id_orignoteletter").val().toLowerCase();
	f_register = $("#id_orignoteregister").val();
	f_accidental = $("#id_orignoteaccidental").val();
  ary = $(obj).val().split(",");
  
  includesks = $("#id_includeks").val();
	if (includesks == "y") { 
    notes = f_letter.toUpperCase() + f_register;
	} else {
    notes = f_letter.toUpperCase() + f_accidental + f_register;
	}
  
  for (var i=1;i<ary.length;i++) {
    notes += "," + ary[i];
  }

  $(obj).val(notes);
}

function StaveUpdate(obj, canvas) {
  stave = canvas.staves[0];

  f_letter = $("#id_orignoteletter").val().toLowerCase();
  f_register = $("#id_orignoteregister").val();
  f_accidental = $("#id_orignoteaccidental").val();
	
  stave.edit_note = null;
  stave.edit_pos = null;
  stave.note_selected = null;
	
  if ($(obj).val().indexOf(",,") !== -1) {
    $(obj).val($(obj).val().replace(",,",","));
  }
  
  stave.notes = [];
  ary = $(obj).val().split(",");
  
  includesks = $("#id_includeks").val();
	if (includesks == "y") { 
    first_note = f_letter.toUpperCase() + f_register;
	} else {
    first_note = f_letter.toUpperCase() + f_accidental + f_register;
	}
  
  if ((ary[0] == "") || (ary[0].toUpperCase() != first_note)) {
    RestoreFirstNote(obj);
    ary = $(obj).val().split(",");
  }
  
  for (var i=0;i<ary.length;i++) {
    letter = ary[i].charAt(0);
	register = ary[i].charAt(ary[i].length-1)
	accidental = ary[i].slice(0,-1);
    accidental = accidental.substr(1);

    if ((letter != "") && (register != "")) {
      if (!(letter.toUpperCase() in LetterPossibilities)) {
        alert(noteletterout);
        RemoveLastEntry(obj);
        return false;
      }

      if (letter != register) {
        if (register in AccidentalPossibilites) {
          return false;
        } else {
          if (!(register.toUpperCase() in RegisterPossibilities)) {
            alert(registerout);
            RemoveLastEntry(obj);
            return false;
          }
        }

        if (letter != register) {
      		if (accidental == "") {
      			stave.notes.push(new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]}));
      		} else {
       			stave.notes.push(new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]}).addAccidental(0, new Vex.Flow.Accidental(accidental)));
      		}
      		
          if (i == 0) {
            stave.notes[stave.notes.length-1].positionable = false;
          }
        	stave.notes[stave.notes.length-1].locked = true;
        }
      } else {
        break;
      }
    }
  }

	for (var i=stave.notes.length;i<note_count;i++) {
		stave.notes.push(new Vex.Flow.GhostNote("w"));
	}

  ReDraw(canvas);

}





function ValidateOptions(letter, accidental, scaletype) {
  note = letter.toUpperCase()+accidental;
  if (scaletype == "ma") {
    if (note in MajorPossibilities) {
      return true;
    }
  } else {
    if (note in MinorPossibilities) {
      return true;
    }
  }
  return false;
}

function FormChanges(letter, register, accidental, scaletype, includesks, forceclef) {
	FormChangeClef(letter, register, accidental, scaletype, includesks, forceclef);

	var ac = 0;
	$('*[id^=id_answer_]:visible').each(function() {
		if ((accidental == "") || (includesks == "y")) {
			canvases[ac].staves[0].notes[0] = new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]});
		} else {
			canvases[ac].staves[0].notes[0] = new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]}).addAccidental(0, new Vex.Flow.Accidental(accidental));
		}

        canvases[ac].staves[0].notes[0].positionable = false;
        canvases[ac].staves[0].notes[0].locked = true;
		ReDraw(canvases[ac]);

		ac++;
	});
}

function FormChangeClef(letter, register, accidental, scaletype, includesks, forceclef) {
	current_clef = clef;
	clef = GetClef(register, letter, forceclef);
	
	var ac = 0;
	$('*[id^=id_answer_]:visible').each(function() {
		var temp_notes = canvases[ac].staves[0].notes.slice(0);
		canvases[ac].staves = [];

		CreateStave(canvases[ac], register, letter, accidental, scaletype, includesks, forceclef, stave_size);
		canvases[ac].staves[0].notes = temp_notes.slice(0);

        SetMouseActions(canvases[ac].canvas.id, canvases[ac], canvases[ac].staves[0]);

        ac++;
    });
}


function SetMouseActions(id, canvas, stave) {
	$("#"+id).unbind('mousemove').bind("mousemove", function(e) { NoteOverlay(e, id, canvas, stave); });
	$("#"+id).bind("mousedown", function(e) {
	    switch (e.which) {
	        case 1:
	            NoteClick(e, id, canvas, stave);
	            break;
	        case 2:
	            break;
	        case 3:
				return false;
	            break;
	        default:
				console.log("mouse click default?");
	    }
	})
	$("#"+id).bind("contextmenu", function(e) {
		if ($("#context_menu").is(":visible")) {  //|| (active_stave.locked == true)
		} else {
			context_canvas = canvas;
			context_stave = stave;
            offset = stave.start_x+20;

			var x = GetX(e);
			var y = GetY(e);

			if ((x >= offset) && (x <= stave_size+50))  {
				for(var i=0;i<stave.notes.length;i++) {
					x_start_pos = stave.notes[i].tickContext.x + offset + interval_adjust;
					x_end_pos = x_start_pos + 45;

					if ((x >= x_start_pos) && (x <= x_end_pos)) {
						if ((stave.notes[i].positionable == true) && (stave.notes[i].locked == true)) {
							note_loc_top = parseInt(stave.notes[i].getYs())+7;
							note_loc_bottom = note_loc_top + 8
            
                            position = $("#"+id).offset();
							if ((note_loc_top <= y) && (note_loc_bottom >= y)) {
                                if (id == "score") {
                                    $("#context_menu").css({"left":(x+150)+"px","top":(y+55)+"px"});
                                } else {
								    $("#context_menu").css({"left":(position.left+x+10)+"px","top":(position.top+y-30)+"px"});
                                }
								$("#context_menu").show();
								stave.edit_note = stave.notes[i];
								stave.edit_pos = i;
							}
						}
					}
				}
			}
		}
		return false;
	});

	$("#cm_clear, #cm_flat, #cm_sharp, #cm_natural, #cm_double_flat, #cm_double_sharp").unbind('click').bind('click', function() { 
		$("#context_menu").hide();

		var id = $(this).attr("id");

		if (id == "cm_clear") { accidental = "" 
		} else if (id == "cm_flat") { accidental = "b";
		} else if (id == "cm_sharp") { accidental = "#";
		} else if (id == "cm_natural") { accidental = "n";
		} else if (id == "cm_double_flat") { accidental = "bb";
		} else if (id == "cm_double_sharp") { accidental = "##";
		}

		this_note = context_stave.edit_note.keys[0];
		note = this_note.charAt(0);
		register = this_note.charAt(this_note.length-1)

		if (accidental == "") {
			context_stave.notes[context_stave.edit_pos] = new Vex.Flow.StaveNote({duration: "w", keys: [note + "/" + register]});
		} else {
			context_stave.notes[context_stave.edit_pos] = new Vex.Flow.StaveNote({duration: "w", keys: [note + "/" + register]}).addAccidental(0, new Vex.Flow.Accidental(accidental));
		}
		
//		active_stave.notes[edit_pos].extraLeftPx = interval_adjust + IntervalAdjust(accidental);

		context_stave.notes[context_stave.edit_pos].locked = true;
		context_stave.edit_note = null;
		context_stave.edit_pos = null;
		context_stave.note_selected = null;

		ReDraw(context_canvas);
        RegenerateAnswer(context_canvas, context_stave)

		return false;
	});

    $("#cancel").unbind('click').bind('click', function() { 
        $("#context_menu").hide();
        return false;
    });
    
    $("#delete").bind('click', function() {
		$("#context_menu").hide();
        context_stave.notes.splice(context_stave.edit_pos,1);
        context_stave.notes.push(new Vex.Flow.GhostNote("w"));

		edit_note = null;
		context_stave.edit_pos = null;
		context_stave.note_selected = null;
		context_stave.first_ghost = null;

        for (var i=0;i<canvases.length;i++) {
            if (canvases[i].canvas.id == context_stave.context.canvas.id) {
                canvas_idx = i;
                break;
            }
        }
        
        RegenerateAnswer(context_canvas, context_stave)
		ReDraw(canvases[canvas_idx]);
		return false;
	})
	
	
}

function NoteClick(e, id, canvas, stave) {
	if ($("#context_menu").is(":visible")) {  //|| (active_stave.locked == true)
	} else {
		var x = GetX(e);
		var y = GetY(e);

        offset = stave.start_x + 25;

		if ((x >= offset) && (x <= stave_size+50))  {
			for(var i=0;i<stave.notes.length;i++) {
				x_start_pos = stave.notes[i].tickContext.x + offset + interval_adjust;
				x_end_pos = x_start_pos + 45;

				if ((x >= x_start_pos) && (x <= x_end_pos)) {
					if (stave.first_ghost != null) {
	 					if (i > stave.first_ghost) {
							stave.note_selected = stave.first_ghost;
						} else {
							stave.note_selected = i;
						}
					} else {
						stave.note_selected = i;
					}
				
					if (stave.notes[stave.note_selected].positionable == true) {
						//toggle the locking mechanism
						if (stave.notes[stave.note_selected].locked == true) {
							stave.notes[stave.note_selected].locked = false;
							stave.notes[stave.note_selected].color = "#808080";
							stave.edit_note = stave.notes[stave.note_selected];
							stave.edit_pos = stave.note_selected;
						} else {
							stave.notes[stave.note_selected].locked = true;
							stave.notes[stave.note_selected].color = null;
							stave.first_ghost = null;
							stave.edit_note = null;
							stave.edit_pos = null;
						}
						ReDraw(canvas);
					    RegenerateAnswer(canvas, stave);
					}
				}
			}
		}	
	}
}

function RegenerateAnswer(canvas, stave) {
    answer = $('[id="'+canvas.answer.id+'"]')
    out = "";

    for (var i=0;i<stave.notes.length;i++) {
        if (stave.notes[i] instanceof Vex.Flow.GhostNote) {
        } else {
            note = stave.notes[i].keys[0];

            if (clef == "bass") {
                for (var index in bass_translate) {
                    if (bass_translate[index] == note) {
                        note = index;
                        break;
                    }
                }
            } else if (clef == "alto") {
                for (var index in alto_translate) {
                    if (alto_translate[index] == note) {
                        note = index;
                        break;
                    }
                }
            } else if (clef == "tenor") {
                for (var index in tenor_translate) {
                    if (tenor_translate[index] == note) {
                        note = index;
                        break;
                    }
                }
            }

            note = note.toUpperCase();

            if (stave.notes[i].modifiers.length > 0) {
                note = note.slice(0,1) + stave.notes[i].modifiers[0].type + note.slice(1);
            }

            if (out != "") { out += ","; }
            out += note;
        }
    }
    out = out.split("/").join("");
    answer.val(out);
}


function NoteOverlay(e, id, canvas, stave) {
	if ($("#context_menu").is(":visible")) {  //|| (active_stave.locked == true)
	} else {
		var x = GetX(e);
		var y = GetY(e);
		
		note_selected = null;
        offset = stave.start_x + 25;

		if ((x >= offset) && (x <= stave_size+50)) {
			if (stave.first_ghost == null)  {
				for(i=0;i<stave.notes.length;i++) {
					if (stave.notes[i] instanceof Vex.Flow.GhostNote) {
						stave.first_ghost = i;
						break;
			}	}	}
			
			for(i=0;i<stave.notes.length;i++) {
				x_start_pos = stave.notes[i].tickContext.x + offset + interval_adjust;
				x_end_pos = x_start_pos + 45;

				if ((x >= x_start_pos) && (x <= x_end_pos)) {
					if (stave.first_ghost != null) {
						if (i > stave.first_ghost) {
							stave.note_selected = stave.first_ghost;
						} else {
							stave.note_selected = i;
						}
					} else {
						stave.note_selected = i;
					}
					
					if (stave.edit_note != null) {
						if (stave.edit_pos != stave.note_selected) {
							stave.notes[stave.edit_pos] = stave.edit_note;
							stave.notes[stave.edit_pos].locked = true;
							stave.notes[stave.edit_pos].color = null;
							stave.edit_note = null;
							stave.edit_pos = null;
					}	}

					if (stave.note_selected != null) {
						if ((stave.notes[stave.note_selected].locked == false) || (stave.notes[stave.note_selected].locked == undefined)) { 
							ClearTempNote(stave);
							DrawNote(y-20, canvas, stave);
							break;
						} else {
							ClearTempNote(stave);
							ReDraw(canvas);
			}	}	}	}
		} else {
			ClearTempNote(stave);
			ReDraw(canvas);
}	}	}

function DrawNote(y, canvas, stave) {
	if (y > 0 && y < 134) {
		register = GetOctave(y);
		letter = GetNote(y);

		//	stave.notes[stave.note_selected] = new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]});
		stave.notes[stave.note_selected] = new Vex.Flow.StaveNote({duration: "w", keys: [letter + "/" + register]});

		//this is for another question type		accidental = $('input[name="accidental"]:checked').val();
		
		//this is for another question type		if (accidental != undefined) { 
		//			active_stave.notes[note_selected].addAccidental(0, new Vex.Flow.Accidental(accidental))
					//either the DrawNote or ReDraw function has to blank out the notes that are displayed.
		//		}

		stave.notes[stave.note_selected].color = "#808080";
		//this is for intervals		active_stave.notes[note_selected].extraLeftPx = interval_adjust + IntervalAdjust("");
	} else {
//		ClearTempNote(stave);
	}
	ReDraw(canvas);
}

function ShowBlankSolution(canvas, stave, letter, register, accidental) {
    if (accidental == "") {
        stave.notes.push(new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]}));
    } else {
        stave.notes.push(new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]}).addAccidental(0, new Vex.Flow.Accidental(accidental)));
    }
    stave.notes[stave.notes.length-1].positionable = false;
    stave.notes[stave.notes.length-1].locked = true;

    RegenerateAnswer(canvas, stave)

	for (var i=stave.notes.length;i<note_count;i++) {
		stave.notes.push(new Vex.Flow.GhostNote("w"));
	}
}

function ShowFullSolution(canvas, stave, answer) {
  a = answer.split(",")
	a = a.filter(function(n) {return n});

  for (var i=0;i<a.length;i++){
    note = a[i];
    letter = note.charAt(0);
    register = note.charAt(note.length-1);

    accidental = note.slice(0,-1);
    accidental = accidental.substr(1);

    //add these note and the moveable should be set too
    if (accidental == "") {
      stave.notes.push(new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]}));
    } else {
      stave.notes.push(new Vex.Flow.StaveNote({duration: "w", keys: [NoteTranslate(letter + "/" + register)]}).addAccidental(0, new Vex.Flow.Accidental(accidental)));
    }

    if (i ==0) {
      stave.notes[stave.notes.length-1].positionable = false;
    }
    stave.notes[stave.notes.length-1].locked = true;
  }

  for (var i=stave.notes.length;i<note_count;i++) {
    stave.notes.push(new Vex.Flow.GhostNote("w"));
  }
  
//  stave.locked = true;
}


function ClearTempNote(stave) {
	if (stave.first_ghost != null) {
		stave.notes[stave.first_ghost] = new Vex.Flow.GhostNote(ghost_note_type);
}	}


function CreateStave(canvas, register, letter, accidental, scaletype, includesks, forceclef, stave_size) {
	clef = GetClef(register, letter, forceclef);
	canvas.staves.push(new Vex.Flow.Stave(10, 20, stave_size));
  canvas.staves[canvas.staves.length-1].addClef(clef).setContext(canvas.context).draw();
	stave = canvas.staves[canvas.staves.length-1];
  
  if (includesks == "y") {
    if (scaletype == "ma") {
      if (MajorKeys.indexOf(letter.toUpperCase() + accidental) > -1) {
        key = letter.toUpperCase()+accidental;
        AddKeySignature(stave, key);
      }
    } else {
      if (MinorKeys.indexOf(letter.toUpperCase() + accidental) > -1) {
        key = letter.toUpperCase()+accidental+"m";
        AddKeySignature(stave, key);
      }
    }
  }

	stave.notes = new Array();
	stave.first_ghost = null;
	stave.note_selected = null;
	stave.edit_note = null;
	stave.edit_pos = null;
}

function AddKeySignature(stave, key) {
  var keySig = new Vex.Flow.KeySignature(key);
  
  //but if the stave is bass - this has to be adjusted down
  if (clef == "bass") {
    //move them down 1 full position
    for(var i=0;i<keySig.accList.length;i++) {
      keySig.accList[i].line += 1;
    }
  } else if (clef == "alto") {
    //move them down .5 position
    for(var i=0;i<keySig.accList.length;i++) {
      keySig.accList[i].line += .5;
    }
  } else if (clef == "tenor") {
    //move them up .5 position
    for(var i=0;i<keySig.accList.length;i++) {
      keySig.accList[i].line -= .5;
    }
  }
  keySig.addToStave(stave);
}


function GetClef(register, letter, forceclef) {
    if (forceclef == "") {
		if ((register in {1:"",2:""}) || ((register == 3) && (letter.toLowerCase() in {"c":"","d":"","e":"","f":""} ))) {
            return "bass";
		} else {
            return "treble";
        }
    } else {
        return forceclef;
}	}

function ReDraw(canvas) {
	canvas.context.clear();

	for (var i=0;i<canvas.staves.length;i++) {
    canvas.staves[i].setContext(canvas.context).draw();	
		Vex.Flow.Formatter.FormatAndDraw(canvas.context, canvas.staves[i], canvas.staves[i].notes);
}	}

function SetModeScale(mode) {
	if (mode == "mm") {
		note_count = 15;
		stave_size = 800;
    } else {
	    note_count = 8;
	    stave_size = 450;
}	}

function NoteTranslate(note) {
	note1 = note.charAt(0).toLowerCase() + note.charAt(note.length-1)
	if (clef == "bass") {
		new_note = bass_translate[note1];
	} else if (clef == "alto") {
		new_note = alto_translate[note1];
	} else if (clef == "tenor") {
		new_note = tenor_translate[note1];
	} else {
	    new_note = note;
	}

	if (new_note == undefined) {
		alert(outofrange)
	} else {
		return new_note;
	}

}

function GetX(e) {
	var x = e.offsetX;
	if (x == undefined) { //this is for firefox
		x = e.layerX;
	}
	return x;
}

function GetY(e) {
	var y = e.offsetY;
	if (y == undefined) { //this is for firefox
		y = e.layerY;
	}
	return y;
}

function GetOctave(y) {
	if (y <= 33) { octave = 6; } 
	else if (y >= 34 && y <= 68) { octave = 5; } 
	else if (y >= 69 && y <= 103) { octave = 4; } 
	else if (y >= 104) { octave = 3 }
	return octave;
}

function GetNote(y) {
	while (y >= 64) { y -= 35; }
	if      (y >=  9 && y <= 13) { note = "g"; }   
	else if (y >= 14 && y <= 18) { note = "f"; }   
	else if (y >= 19 && y <= 23) { note = "e"; }   
	else if (y >= 24 && y <= 28) { note = "d"; } 
	else if (y >= 29 && y <= 33) { note = "c"; } 
	else if (y >= 34 && y <= 38) { note = "b"; }
	else if (y >= 39 && y <= 43) { note = "a"; } 
	else if (y >= 44 && y <= 48) { note = "g"; } 
	else if (y >= 49 && y <= 53) { note = "f"; } 
	else if (y >= 54 && y <= 58) { note = "e"; } 
	else if (y >= 59 && y <= 63) { note = "d"; }
	return note;
}



bass_translate = {};
bass_translate['e4'] = 'c/7';
bass_translate['d4'] = 'b/6';
bass_translate['c4'] = 'a/6';
bass_translate['b3'] = 'g/6';
bass_translate['a3'] = 'f/6';
bass_translate['g3'] = 'e/6';
bass_translate['f3'] = 'd/6';
bass_translate['e3'] = 'c/6';
bass_translate['d3'] = 'b/5';
bass_translate['c3'] = 'a/5';
bass_translate['b2'] = 'g/5';
bass_translate['a2'] = 'f/5';
bass_translate['g2'] = 'e/5';
bass_translate['f2'] = 'd/5';
bass_translate['e2'] = 'c/5';
bass_translate['d2'] = 'b/4';
bass_translate['c2'] = 'a/4';
bass_translate['b1'] = 'g/4';
bass_translate['a1'] = 'f/4';
bass_translate['g1'] = 'e/4';
bass_translate['f1'] = 'd/4';
bass_translate['e1'] = 'c/4';
bass_translate['d1'] = 'b/3';
bass_translate['c1'] = 'a/3';
bass_translate['b0'] = 'g/3';
bass_translate['a0'] = 'f/3';
bass_translate['g0'] = 'e/3';
bass_translate['f0'] = 'd/3';
bass_translate['e0'] = 'c/3';
bass_translate['d0'] = 'b/2';
bass_translate['c0'] = 'a/2';


alto_translate = {}
alto_translate['f4'] = 'e/6';
alto_translate['e4'] = 'd/6';
alto_translate['d4'] = 'c/6';
alto_translate['c4'] = 'b/5';
alto_translate['b3'] = 'a/5';
alto_translate['a3'] = 'g/5';
alto_translate['g3'] = 'f/5';
alto_translate['f3'] = 'e/5';
alto_translate['e3'] = 'd/5';
alto_translate['d3'] = 'c/5';
alto_translate['c3'] = 'b/4';
alto_translate['b2'] = 'a/4';
alto_translate['a2'] = 'g/4';
alto_translate['g2'] = 'f/4';
alto_translate['f2'] = 'e/4';
alto_translate['e2'] = 'd/4';
alto_translate['d2'] = 'c/4';
alto_translate['c2'] = 'b/3';
alto_translate['b1'] = 'a/3';
alto_translate['a1'] = 'g/3';
alto_translate['g1'] = 'f/3';


tenor_translate = {}
tenor_translate['d4'] = 'e/6';
tenor_translate['c4'] = 'd/6';
tenor_translate['b3'] = 'c/6';
tenor_translate['a3'] = 'b/5';
tenor_translate['g3'] = 'a/5';
tenor_translate['f3'] = 'g/5';
tenor_translate['e3'] = 'f/5';
tenor_translate['d3'] = 'e/5';
tenor_translate['c3'] = 'd/5';
tenor_translate['b2'] = 'c/5';
tenor_translate['a2'] = 'b/4';
tenor_translate['g2'] = 'a/4';
tenor_translate['f2'] = 'g/4';
tenor_translate['e2'] = 'f/4';
tenor_translate['d2'] = 'e/4';
tenor_translate['c2'] = 'd/4';
tenor_translate['b1'] = 'c/4';
tenor_translate['a1'] = 'b/3';
tenor_translate['g1'] = 'a/3';
tenor_translate['f1'] = 'g/3';
tenor_translate['e1'] = 'f/3';


MajorKeys = ["C","D","E","F","G","A","B","C#","F#","Cb","Db","Eb","Gb","Ab","Bb"]
MinorKeys = ["C","D","E","F","G","A","B","C#","D#","F#","G#","A#","Eb","Ab","Bb"]
MajorPossibilities = {"C":"","D":"","E":"","F":"","G":"","A":"","B":"","C#":"","F#":"","Cb":"","Db":"","Eb":"","Gb":"","Ab":"","Bb":""}
MinorPossibilities = {"C":"","D":"","E":"","F":"","G":"","A":"","B":"","C#":"","D#":"","F#":"","G#":"","A#":"","Eb":"","Ab":"","Bb":""}
LetterPossibilities = {"C":"","D":"","E":"","F":"","G":"","A":"","B":""}
RegisterPossibilities = {"1":"","2":"","3":"","4":"","5":"","6":""}
AccidentalPossibilites = {"#":"","##":"","b":"","bb":"","n":""}








