import * as latex from './pdf_tex_engine.js';

export async function exportPDF(textext) {
  const globalEn = new latex.PdfTeXEngine();

  await globalEn.loadEngine();

  if (!globalEn.isReady()) {
    console.log('Engine not ready yet');

    return undefined;
  }

  globalEn.writeMemFSFile('main.tex', textext);

  globalEn.setEngineMainFile('main.tex');

  const r = await globalEn.compileLaTeX();

  console.log(r);

  if (r.status === 0) {
    const pdfblob = new Blob([r.pdf], { type: 'application/pdf' });

    const objectURL = URL.createObjectURL(pdfblob);

    setTimeout(() => {
      URL.revokeObjectURL(objectURL);
    }, 30000);

    console.log(objectURL);

    return objectURL;
  }

  return undefined;
}

export function generateLatex(data) {
  let text = `\\documentclass{tufte-book}

\\hypersetup{colorlinks}% uncomment this line if you prefer colored hyperlinks (e.g., for onscreen viewing)

%%
% Book metadata
\\title{A History Book\\thanks{Thanks to the Tufte-LaTeX developers for design}}
\\author[Anton Davydov]{Anton Davydov}
\\publisher{Self-published}

%%
% If they're installed, use Bergamo and Chantilly from www.fontsite.com.
% They're clones of Bembo and Gill Sans, respectively.
%\\IfFileExists{bergamo.sty}{\\usepackage[osf]{bergamo}}{}% Bembo
%\\IfFileExists{chantill.sty}{\\usepackage{chantill}}{}% Gill Sans

%\\usepackage{microtype}

%%
% Just some sample text
\\usepackage{lipsum}

%%
% For nicely typeset tabular material
\\usepackage{booktabs}

%%
% For graphics / images
\\usepackage{graphicx}
\\setkeys{Gin}{width=\\linewidth,totalheight=\\textheight,keepaspectratio}
\\graphicspath{{graphics/}}

% The fancyvrb package lets us customize the formatting of verbatim
% environments.  We use a slightly smaller font.
\\usepackage{fancyvrb}
\\fvset{fontsize=\\normalsize}

%%
% Prints argument within hanging parentheses (i.e., parentheses that take
% up no horizontal space).  Useful in tabular environments.
\\newcommand{\\hangp}[1]{\\makebox[0pt][r]{(}#1\\makebox[0pt][l]{)}}

%%
% Prints an asterisk that takes up no horizontal space.
% Useful in tabular environments.
\\newcommand{\\hangstar}{\\makebox[0pt][l]{*}}

%%
% Prints a trailing space in a smart way.
\\usepackage{xspace}

%%
% Some shortcuts for Tufte's book titles.  The lowercase commands will
% produce the initials of the book title in italics.  The all-caps commands
% will print out the full title of the book in italics.
\\newcommand{\\vdqi}{\\textit{VDQI}\\xspace}
\\newcommand{\\ei}{\\textit{EI}\\xspace}
\\newcommand{\\ve}{\\textit{VE}\\xspace}
\\newcommand{\\be}{\\textit{BE}\\xspace}
\\newcommand{\\VDQI}{\\textit{The Visual Display of Quantitative Information}\\xspace}
\\newcommand{\\EI}{\\textit{Envisioning Information}\\xspace}
\\newcommand{\\VE}{\\textit{Visual Explanations}\\xspace}
\\newcommand{\\BE}{\\textit{Beautiful Evidence}\\xspace}

\\newcommand{\\TL}{Tufte-\\LaTeX\\xspace}

% Prints the month name (e.g., January) and the year (e.g., 2008)
\\newcommand{\\monthyear}{%
  \\ifcase\\month\\or January\\or February\\or March\\or April\\or May\\or June\\or
  July\\or August\\or September\\or October\\or November\\or
  December\\fi\\space\\number\\year
}


% Prints an epigraph and speaker in sans serif, all-caps type.
\\newcommand{\\openepigraph}[2]{%
  %\\sffamily\\fontsize{14}{16}\\selectfont
  \\begin{fullwidth}
  \\sffamily\\large
  \\begin{doublespace}
  \\noindent\\allcaps{#1}\\\\% epigraph
  \\noindent\\allcaps{#2}% author
  \\end{doublespace}
  \\end{fullwidth}
}

% Inserts a blank page
\\newcommand{\\blankpage}{\\newpage\\hbox{}\\thispagestyle{empty}\\newpage}

\\usepackage{units}

% Typesets the font size, leading, and measure in the form of 10/12x26 pc.
\\newcommand{\\measure}[3]{#1/#2$\\times$\\unit[#3]{pc}}

% Macros for typesetting the documentation
\\newcommand{\\hlred}[1]{\\textcolor{Maroon}{#1}}% prints in red
\\newcommand{\\hangleft}[1]{\\makebox[0pt][r]{#1}}
\\newcommand{\\hairsp}{\\hspace{1pt}}% hair space
\\newcommand{\\hquad}{\\hskip0.5em\\relax}% half quad space
\\newcommand{\\TODO}{\\textcolor{red}{\\bf TODO!}\\xspace}
\\newcommand{\\ie}{\\textit{i.\\hairsp{}e.}\\xspace}
\\newcommand{\\eg}{\\textit{e.\\hairsp{}g.}\\xspace}
\\newcommand{\\na}{\\quad--}% used in tables for N/A cells
\\providecommand{\\XeLaTeX}{X\\lower.5ex\\hbox{\\kern-0.15em\\reflectbox{E}}\\kern-0.1em\\LaTeX}
\\newcommand{\\tXeLaTeX}{\\XeLaTeX\\index{XeLaTeX@\\protect\\XeLaTeX}}
% \\index{\\texttt{\\textbackslash xyz}@\\hangleft{\\texttt{\\textbackslash}}\\texttt{xyz}}
\\newcommand{\\tuftebs}{\\symbol{'134}}% a backslash in tt type in OT1/T1
\\newcommand{\\doccmdnoindex}[2][]{\\texttt{\\tuftebs#2}}% command name -- adds backslash automatically (and doesn't add cmd to the index)
\\newcommand{\\doccmddef}[2][]{%
  \\hlred{\\texttt{\\tuftebs#2}}\\label{cmd:#2}%
  \\ifthenelse{\\isempty{#1}}%
    {% add the command to the index
      \\index{#2 command@\\protect\\hangleft{\\texttt{\\tuftebs}}\\texttt{#2}}% command name
    }%
    {% add the command and package to the index
      \\index{#2 command@\\protect\\hangleft{\\texttt{\\tuftebs}}\\texttt{#2} (\\texttt{#1} package)}% command name
      \\index{#1 package@\\texttt{#1} package}\\index{packages!#1@\\texttt{#1}}% package name
    }%
}% command name -- adds backslash automatically
\\newcommand{\\doccmd}[2][]{%
  \\texttt{\\tuftebs#2}%
  \\ifthenelse{\\isempty{#1}}%
    {% add the command to the index
      \\index{#2 command@\\protect\\hangleft{\\texttt{\\tuftebs}}\\texttt{#2}}% command name
    }%
    {% add the command and package to the index
      \\index{#2 command@\\protect\\hangleft{\\texttt{\\tuftebs}}\\texttt{#2} (\\texttt{#1} package)}% command name
      \\index{#1 package@\\texttt{#1} package}\\index{packages!#1@\\texttt{#1}}% package name
    }%
}% command name -- adds backslash automatically
\\newcommand{\\docopt}[1]{\\ensuremath{\\langle}\\textrm{\\textit{#1}}\\ensuremath{\\rangle}}% optional command argument
\\newcommand{\\docarg}[1]{\\textrm{\\textit{#1}}}% (required) command argument
\\newenvironment{docspec}{\\begin{quotation}\\ttfamily\\parskip0pt\\parindent0pt\\ignorespaces}{\\end{quotation}}% command specification environment
\\newcommand{\\docenv}[1]{\\texttt{#1}\\index{#1 environment@\\texttt{#1} environment}\\index{environments!#1@\\texttt{#1}}}% environment name
\\newcommand{\\docenvdef}[1]{\\hlred{\\texttt{#1}}\\label{env:#1}\\index{#1 environment@\\texttt{#1} environment}\\index{environments!#1@\\texttt{#1}}}% environment name
\\newcommand{\\docpkg}[1]{\\texttt{#1}\\index{#1 package@\\texttt{#1} package}\\index{packages!#1@\\texttt{#1}}}% package name
\\newcommand{\\doccls}[1]{\\texttt{#1}}% document class name
\\newcommand{\\docclsopt}[1]{\\texttt{#1}\\index{#1 class option@\\texttt{#1} class option}\\index{class options!#1@\\texttt{#1}}}% document class option name
\\newcommand{\\docclsoptdef}[1]{\\hlred{\\texttt{#1}}\\label{clsopt:#1}\\index{#1 class option@\\texttt{#1} class option}\\index{class options!#1@\\texttt{#1}}}% document class option name defined
\\newcommand{\\docmsg}[2]{\\bigskip\\begin{fullwidth}\\noindent\\ttfamily#1\\end{fullwidth}\\medskip\\par\\noindent#2}
\\newcommand{\\docfilehook}[2]{\\texttt{#1}\\index{file hooks!#2}\\index{#1@\\texttt{#1}}}
\\newcommand{\\doccounter}[1]{\\texttt{#1}\\index{#1 counter@\\texttt{#1} counter}}

% Generates the index
\\usepackage{makeidx}
\\makeindex

\\begin{document}

% Front matter
\\frontmatter

% r.1 blank page
\\blankpage

% v.2 epigraphs
\\newpage\\thispagestyle{empty}
\\openepigraph{%
The public is more familiar with bad design than good design.
It is, in effect, conditioned to prefer bad design,
because that is what it lives with.
The new becomes threatening, the old reassuring.
}{Paul Rand%, {\\itshape Design, Form, and Chaos}
}
\\vfill
\\openepigraph{%
A designer knows that he has achieved perfection
not when there is nothing left to add,
but when there is nothing left to take away.
}{Antoine de Saint-Exup\\'{e}ry}
\\vfill
\\openepigraph{%
\\ldots the designer of a new system must not only be the implementor and the first
large-scale user; the designer should also write the first user manual\\ldots
If I had not participated fully in all these activities,
literally hundreds of improvements would never have been made,
because I would never have thought of them or perceived
why they were important.
}{Donald E. Knuth}


% r.3 full title page
\\maketitle


% v.4 copyright page
\\newpage
\\begin{fullwidth}
~\\vfill
\\thispagestyle{empty}
\\setlength{\\parindent}{0pt}
\\setlength{\\parskip}{\\baselineskip}
Copyright \\copyright\\ \\the\\year\\ \\thanklessauthor

\\par\\smallcaps{Published by \\thanklesspublisher}

\\par\\smallcaps{tufte-latex.googlecode.com}

\\par Licensed under the Apache License, Version 2.0 (the License); you may not
use this file except in compliance with the License. You may obtain a copy
of the License at \\url{http://www.apache.org/licenses/LICENSE-2.0}. Unless
required by applicable law or agreed to in writing, software distributed
under the License is distributed on an \\smallcaps{AS IS BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND}, either express or implied. See the
License for the specific language governing permissions and limitations
under the License.\\index{license}

\\par\\textit{First printing, \\monthyear}
\\end{fullwidth}

% r.5 contents
\\tableofcontents

\\listoffigures

\\listoftables

% r.7 dedication
\\cleardoublepage
~\\vfill
\\begin{doublespace}
\\noindent\\fontsize{18}{22}\\selectfont\\itshape
\\nohyphenation
Dedicated to those who appreciate \\LaTeX{}
and the work of \\mbox{Edward R.~Tufte}
and \\mbox{Donald E.~Knuth}.
\\end{doublespace}
\\vfill
\\vfill


\\chapter{Test of a history book}
\\label{ch:history-book}

\\begin{description}
`;
  for (const entry of data) {
    // console.log(entry);
    text += `
\\item[\\docfilehook{${entry.HOST_DATE}}{common}] ${entry.DATUM}
`;
  }
  text += `\\end{description}

\\backmatter

\\bibliography{sample-handout}
\\bibliographystyle{plainnat}


\\printindex

\\end{document}
`;
  return text;
}
