import React, { useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, TextNode, $createTextNode } from "lexical";
import DropDown, { DropDownItem } from "../ui/DropDown";


const greekSymbols = [
  { letter: "Alpha", uppercase: "Α", lowercase: "α" },
  { letter: "Beta", uppercase: "Β", lowercase: "β" },
  { letter: "Gamma", uppercase: "Γ", lowercase: "γ" },
  { letter: "Delta", uppercase: "Δ", lowercase: "δ" },
  { letter: "Epsilon", uppercase: "Ε", lowercase: "ε" },
  { letter: "Zeta", uppercase: "Ζ", lowercase: "ζ" },
  { letter: "Eta", uppercase: "Η", lowercase: "η" },
  { letter: "Theta", uppercase: "Θ", lowercase: "θ" },
  { letter: "Iota", uppercase: "Ι", lowercase: "ι" },
  { letter: "Kappa", uppercase: "Κ", lowercase: "κ" },
  { letter: "Lambda", uppercase: "Λ", lowercase: "λ" },
  { letter: "Mu", uppercase: "Μ", lowercase: "μ" },
  { letter: "Nu", uppercase: "Ν", lowercase: "ν" },
  { letter: "Xi", uppercase: "Ξ", lowercase: "ξ" },
  { letter: "Omicron", uppercase: "Ο", lowercase: "ο" },
  { letter: "Pi", uppercase: "Π", lowercase: "π" },
  { letter: "Rho", uppercase: "Ρ", lowercase: "ρ" },
  { letter: "Sigma", uppercase: "Σ", lowercase: "σ" },
  { letter: "Tau", uppercase: "Τ", lowercase: "τ" },
  { letter: "Upsilon", uppercase: "Υ", lowercase: "υ" },
  { letter: "Phi", uppercase: "Φ", lowercase: "φ" },
  { letter: "Chi", uppercase: "Χ", lowercase: "χ" },
  { letter: "Psi", uppercase: "Ψ", lowercase: "ψ" },
  { letter: "Omega", uppercase: "Ω", lowercase: "ω" },
  { letter: "Digamma", uppercase: "Ϝ", lowercase: "ϝ" },
]


export default function SymbolPlugin() {
  const [editor] = useLexicalComposerContext();
  const [isOpen, setIsOpen] = useState(false);

  const insertSymbol = (symbol: string) => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const selectedNode = selection.anchor.getNode();

        let fontSize = "inherit"; // Default to inherit if no specific font size is found

        if (selectedNode instanceof TextNode) {
          // Retrieve the font size style if it exists on the selected TextNode
          const style = selectedNode.getStyle();
          fontSize = style?.match(/font-size:\s*(\S+);/)?.[1] || fontSize;
        }

        // Create a new TextNode for the symbol and apply the font size
        const symbolNode = $createTextNode(symbol);
        selection.insertNodes([symbolNode]);
      }
    });
    setIsOpen(false);
  };

return (
  <div title="Symbols" className="symbol-dropdown">
    <DropDown
      buttonClassName="toolbar-item block-controls"
      buttonAriaLabel="For applying Symbols"
      buttonLabel="Symbols"
    >
      <div className="symbol-container">
        {greekSymbols.map(({ letter, uppercase, lowercase }) => (
          <div key={letter} className="symbol-pair">
            <DropDownItem className="symbol-item" onClick={() => insertSymbol(lowercase)}>{lowercase}</DropDownItem>
            <DropDownItem className="symbol-item" onClick={() => insertSymbol(uppercase)}>{uppercase}</DropDownItem>
          </div>
        ))}
      </div>
    </DropDown>
  </div>
);
}
