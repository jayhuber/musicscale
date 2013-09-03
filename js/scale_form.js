$().ready(function() {
  $("form.mform").submit(function() {
    $('*[id^=id_answer_]:visible').each(function() {
      answer = $("#"+this.id).val();
      if (answer.indexOf(",") == -1) {
        $("#"+this.id).val("");
      }
    });
  });

  $('#id_includeks, #id_modescale, #id_orignoteletter, #id_orignoteaccidental, #id_orignoteregister, #id_forceclef').change(function() {
    includesks = $("#id_includeks").val();
		letter = $("#id_orignoteletter").val().toLowerCase();
		register = $("#id_orignoteregister").val();
		accidental = $("#id_orignoteaccidental").val();
		forceclef = $("#id_forceclef").val();
    scaletype = $("#id_modescale").val();

    if (ValidateOptions(letter,accidental,scaletype) == false) {
      alert(nonexistkey);
      return false;
    }

		FormChanges(letter, register, accidental, scaletype, includesks, forceclef);
		
		$('*[id^=id_answer_]:visible').each(function() {
      for (var i=0;i<canvases.length;i++) {
        if (this.id == canvases[i].answer.id) {
          StaveUpdate(this, canvases[i])
        }
        ReDraw(canvases[i]);
      }
    })
    
    
  });

//	console.log("include key signature: "+$("#id_includeks").val());
//	console.log("scale type: "+$("#id_modescale").val());
//	console.log("tonic letter: "+$("#id_orignoteletter").val());
//	console.log("tonic accidental: "+$("#id_orignoteaccidental").val());
//	console.log("tonic register: "+$("#id_orignoteregister").val());
//	console.log("force clef: "+$("#id_forceclef").val());

	menu = '<div class="musicscale"><div id="context_menu" style="z-index:2;">';
	menu += '<img src="type/musicscale/images/empty.png" id="cm_clear">';
	menu += '<img src="type/musicscale/images/s_flat.png" id="cm_flat">';
	menu += '<img src="type/musicscale/images/s_sharp.png" id="cm_sharp">';
	menu += '<img src="type/musicscale/images/s_natural.png" id="cm_natural">';
	menu += '<img src="type/musicscale/images/s_double_flat.png" id="cm_double_flat">';
	menu += '<img src="type/musicscale/images/s_double_sharp.png" id="cm_double_sharp">';
	menu += '<div>';
	menu += '<span id="cancel" class="button">Cancel</span>';
	menu += '<span id="delete" class="button">Delete</span>';
	menu += '</div>';
	menu += '</div>';
	menu += '</div>';

	$("body").prepend(menu);

	var ac = 0;
	$('*[id^=answerhdr_]:visible').each(function() {
		$(this).addClass("music").addClass("musicscale");
	});

	mode = $("#id_modescale").val();
	SetModeScale(mode);

	var ac = 0;
	$('*[id^=id_answer_]:visible').each(function() {
		can = $('<canvas id="canvas_'+ac+'" class="music" width="'+(stave_size+50)+'" height="150" />')[0];
		ren = new Vex.Flow.Renderer(can, Vex.Flow.Renderer.Backends.CANVAS);
		ctx = ren.getContext();

		$(can).insertBefore($(this));
		$("'<br />')").insertBefore($(this));

		canvases.push({canvas:can, renderer:ren, context:ctx, staves: Array()});

		var this_canvas = canvases[canvases.length-1];
        this_canvas.answer = this;
        $(this).css("width","250");

		register = $("#id_orignoteregister").val();
		letter = $("#id_orignoteletter").val();
		accidental = $("#id_orignoteaccidental").val();
		clef = $("#id_forceclef").val();
    scaletype = $("#id_modescale").val();
    includesks = $("#id_includeks").val();
    
		CreateStave(this_canvas, register, letter, accidental, scaletype, includesks, clef, stave_size);

		//draw the notes
		answer = $("#id_answer_"+ac).val();
    
    $("#id_answer_"+ac).bind('keyup', function(){
      StaveUpdate(this, this_canvas);
    })

		var this_stave = this_canvas.staves[this_canvas.staves.length-1];

		if ((answer != "") && ($("#id_answer_0").val().indexOf(",") > 0)) {
			ShowFullSolution(this_canvas, this_stave, answer);
    } else {
    	letter = $("#id_orignoteletter").val().toLowerCase();
    	register = $("#id_orignoteregister").val();
    	accidental = $("#id_orignoteaccidental").val();

			ShowBlankSolution(this_canvas, this_stave, letter, register, accidental);
		}

		ReDraw(this_canvas);
		
		SetMouseActions(this_canvas.canvas.id, this_canvas, this_stave);

		ac++;
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

		ReDraw(canvases[canvas_idx]);
		return false;
	})

})





