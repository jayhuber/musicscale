$().ready(function() {
  //how many q_setup variables do we have and loop thru them
  for (var i=0;i<q_setup.length;i++) {
    qtype = q_setup[i]["type"];
    register = q_setup[i]["register"];
    letter = q_setup[i]["letter"];
    accidental = q_setup[i]["accidental"];
    forceclef = q_setup[i]["forceclef"];
    modescale = q_setup[i]["modescale"];
    includesks = q_setup[i]["includeks"];
    answer = q_setup[i]["answer"].replace(":","\\:");
    slot = q_setup[i]["slot"];
    
    var can = $("#score_" + slot)[0];
    var ren = new Vex.Flow.Renderer(can, Vex.Flow.Renderer.Backends.CANVAS);
    var ctx = ren.getContext();

    SetModeScale(modescale);
    
    canvases.push({canvas:can, renderer:ren, context:ctx, staves: Array()});
    canvases[canvases.length-1].answer = $("#"+answer)[0];
    CreateStave(canvases[canvases.length-1], register, letter, accidental, modescale, includesks, forceclef, stave_size);
    SetupNotes(canvases[canvases.length-1],register,letter,accidental,includesks, answer);

    if (a_setup.length != 0) {
      answers = a_setup[i]["answer"].split("|");
      for (var i=0;i<answers.length;i++) {
        can = $("#answer_"+i)[0];
        ren = new Vex.Flow.Renderer(can, Vex.Flow.Renderer.Backends.CANVAS);
        ctx = ren.getContext();

        canvases.push({canvas:can, renderer:ren, context:ctx, staves: Array()});
        canvas = canvases[canvases.length-1];
        canvas.answer = answers[i];
        
        CreateStave(canvas, register, letter, accidental, modescale, includesks, forceclef, stave_size);
        ShowFullSolution(canvas, canvas.staves[0], answers[i]);
        ReDraw(canvases[canvases.length-1]);
      }
    } else {
      SetMouseActions(canvases[canvases.length-1].canvas.id, canvases[canvases.length-1], canvases[canvases.length-1].staves[0]);
    }
  }
})

function SetupNotes(canvas,register,letter,accidental,includesks, answer) {
  answer = $('[id="'+canvas.answer.id+'"]')
	if ((answer.val() != "") && (answer.val().indexOf(",") > 0)) {
	  ShowFullSolution(canvas, canvas.staves[0], answer.val());
  } else {
    ShowBlankSolution(canvas, stave, letter, register, accidental);
  }
  ReDraw(canvas);
}

