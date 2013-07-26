var can = $("#score")[0];
var ren = new Vex.Flow.Renderer(can, Vex.Flow.Renderer.Backends.CANVAS);
var ctx = ren.getContext();

$().ready(function() {
    qtype = q_setup["type"];

    register = q_setup["register"];
    letter = q_setup["letter"];
    accidental = q_setup["accidental"];
    forceclef = q_setup["forceclef"];
    modescale = q_setup["modescale"];
    includesks = q_setup["includeks"];
    answer = q_setup["answer"].replace(":","\\:");

    SetModeScale(modescale);

    canvases.push({canvas:can, renderer:ren, context:ctx, staves: Array()});
    canvases[canvases.length-1].answer = $("#"+answer)[0];
    CreateStave(canvases[canvases.length-1], register, letter, accidental, modescale, includesks, forceclef, stave_size);
    SetupNotes(canvases[canvases.length-1],register,letter,accidental,includesks, answer);

    if (typeof a_setup!='undefined') {
        answers = a_setup["answer"].split("|");
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

