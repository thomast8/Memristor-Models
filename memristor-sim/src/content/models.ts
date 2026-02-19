/**
 * Educational content for each memristor model.
 *
 * Contains human-readable descriptions, LaTeX equations, and paper
 * references. The text is extracted from the PhD thesis docstrings
 * and expanded for clarity.
 */

export interface EquationBlock {
  latex: string;
  label: string;
}

export interface ModelContent {
  name: string;
  shortDescription: string;
  fullDescription: string;
  equations: EquationBlock[];
  references: string[];
}

export const MODEL_CONTENT: Record<string, ModelContent> = {
  yakopcic: {
    name: 'Yakopcic Generalised Model',
    shortDescription:
      'A behavioural model using a sinh I-V relationship with threshold-gated ' +
      'state evolution. Fits a wide variety of oxide-based memristors.',
    fullDescription:
      'The Yakopcic model is a generalised behavioural model for memristive devices. ' +
      'Unlike physical models that simulate ion drift directly, it captures the ' +
      'essential switching characteristics using mathematical functions fitted to ' +
      'experimental data.\n\n' +
      'The current through the device follows a hyperbolic sine relationship with ' +
      'voltage, modulated by a state variable x ∈ [0, 1] that represents the ' +
      'internal resistance state. The state variable evolves only when the applied ' +
      'voltage exceeds a threshold (Vp or Vn), and its motion is bounded by ' +
      'windowing functions that prevent it from exceeding physical limits.\n\n' +
      'This model has been successfully fitted to devices from multiple research ' +
      'groups including Oblea, Miao, and Jo, demonstrating its generality.',
    equations: [
      {
        latex: 'I(t) = \\begin{cases} a_1 \\cdot x(t) \\cdot \\sinh(b \\cdot V(t)) & V(t) \\geq 0 \\\\ a_2 \\cdot x(t) \\cdot \\sinh(b \\cdot V(t)) & V(t) < 0 \\end{cases}',
        label: 'I-V Relationship',
      },
      {
        latex: '\\frac{dx}{dt} = \\eta \\cdot g(V(t)) \\cdot f(V(t),\\, x(t))',
        label: 'State Evolution',
      },
      {
        latex: 'g(V) = \\begin{cases} A_p(e^V - e^{V_p}) & V > V_p \\\\ -A_n(e^{-V} - e^{V_n}) & V < -V_n \\\\ 0 & \\text{otherwise} \\end{cases}',
        label: 'Threshold Function',
      },
      {
        latex: 'f(V, x) = \\begin{cases} e^{-\\alpha_p(x - x_p)} \\cdot w_p(x) & \\eta V \\geq 0,\\; x \\geq x_p \\\\ 1 & \\eta V \\geq 0,\\; x < x_p \\\\ e^{\\alpha_n(x + x_n - 1)} \\cdot w_n(x) & \\eta V < 0,\\; x \\leq 1 - x_n \\\\ 1 & \\eta V < 0,\\; x > 1 - x_n \\end{cases}',
        label: 'Windowing Function',
      },
      {
        latex: 'w_p(x) = \\frac{x_p - x}{1 - x_p} + 1 \\qquad w_n(x) = \\frac{x}{1 - x_n}',
        label: 'Window Bounds',
      },
    ],
    references: [
      'C. Yakopcic, T. M. Taha, G. Subramanyam, R. E. Pino, and S. Rogers, "A Memristor Device Model," IEEE Electron Device Letters, vol. 32, no. 10, pp. 1436-1438, Oct. 2011.',
      'A. S. Oblea, A. Timilsina, D. Moore, and K. A. Campbell, "Silver Chalcogenide Based Memristor Devices," in IJCNN, 2010.',
    ],
  },

  hp_labs: {
    name: 'HP Labs Ion-Drift Model',
    shortDescription:
      'A physical model based on the drift of oxygen vacancies in a ' +
      'thin TiO₂ film. The original model from HP Labs\' landmark 2008 paper.',
    fullDescription:
      'This is the first practical memristor model, published by HP Labs ' +
      'researchers who identified memristive behaviour in a nanoscale TiO₂ ' +
      'device. The model describes a thin film with two regions: a doped ' +
      'region (width w, low resistance RON) and an undoped region (width ' +
      'D − w, high resistance ROFF).\n\n' +
      'The normalised state variable x = w/D represents what fraction of ' +
      'the device is in the low-resistance state. As current flows, oxygen ' +
      'vacancies drift through the film, moving the boundary between doped ' +
      'and undoped regions, which changes the total resistance.\n\n' +
      'A window function F(x) is required to prevent the state from leaving ' +
      'the physical range [0, 1]. Different window functions model different ' +
      'boundary effects — Joglekar is the simplest, while Biolek adds ' +
      'current-direction dependence for more realistic behaviour.',
    equations: [
      {
        latex: 'R(x) = R_{\\mathrm{ON}} \\cdot x + R_{\\mathrm{OFF}} \\cdot (1 - x)',
        label: 'State-Dependent Resistance',
      },
      {
        latex: 'I(t) = \\frac{V(t)}{R(x(t))}',
        label: 'Ohm\'s Law',
      },
      {
        latex: '\\frac{dx}{dt} = \\frac{\\mu_D \\cdot R_{\\mathrm{ON}}}{D^2} \\cdot I(t) \\cdot F(x, I)',
        label: 'State Evolution (Ion Drift)',
      },
      {
        latex: 'F_{\\text{Joglekar}}(x) = 1 - (2x - 1)^{2p}',
        label: 'Joglekar Window',
      },
      {
        latex: 'F_{\\text{Biolek}}(x, I) = 1 - (x - H(-I))^{2p}',
        label: 'Biolek Window',
      },
    ],
    references: [
      'D. B. Strukov, G. S. Snider, D. R. Stewart, and R. S. Williams, "The missing memristor found," Nature, vol. 453, pp. 80-83, May 2008.',
      'J. J. Yang, M. D. Pickett, X. Li, D. A. A. Ohlberg, D. R. Stewart, and R. S. Williams, "Memristive switching mechanism for metal/oxide/metal nanodevices," Nature Nanotechnology, vol. 3, pp. 429-433, Jul. 2008.',
      'Y. N. Joglekar and S. J. Wolf, "The elusive memristor: properties of basic electrical circuits," European Journal of Physics, vol. 30, no. 4, pp. 661-675, 2009.',
      'D. Biolek, Z. Biolek, and V. Biolkova, "SPICE Model of Memristor with Nonlinear Dopant Drift," Radioengineering, vol. 18, no. 2, pp. 210-214, Jun. 2009.',
    ],
  },
};

/** What is a memristor? */
export const MEMRISTOR_INTRO = {
  title: 'What is a Memristor?',
  content:
    'The memristor (memory resistor) is the fourth fundamental passive circuit ' +
    'element, alongside the resistor, capacitor, and inductor. Predicted ' +
    'theoretically by Leon Chua in 1971 and first physically demonstrated by ' +
    'HP Labs in 2008, it is a two-terminal device whose resistance depends on ' +
    'the history of current that has flowed through it.\n\n' +
    'Think of it as a resistor with memory — when you turn off the power, it ' +
    'remembers its last resistance state. This makes memristors promising for ' +
    'non-volatile memory, neuromorphic computing (they naturally mimic synaptic ' +
    'behaviour), and analog computation.\n\n' +
    'The hallmark of a memristor is the "pinched hysteresis loop" in its I-V ' +
    'characteristic: when driven by a periodic voltage, the current traces out ' +
    'a figure-eight that always passes through the origin. This shape arises ' +
    'because the device resistance is different during the rising and falling ' +
    'portions of the voltage sweep.',
  keyEquation: 'M(q) = \\frac{d\\varphi}{dq}',
  keyEquationLabel: 'Chua\'s Definition: Memristance relates magnetic flux (φ) to charge (q)',
};
