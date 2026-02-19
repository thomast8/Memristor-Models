/**
 * Parameter group labels and descriptions for the UI.
 */

/** Human-readable names for parameter groups. */
export const GROUP_LABELS: Record<string, string> = {
  iv: 'I-V Relationship',
  threshold: 'Threshold Voltages',
  state: 'State Variable Dynamics',
  device: 'Device Physics',
};

/** Brief descriptions of what each parameter group controls. */
export const GROUP_DESCRIPTIONS: Record<string, string> = {
  iv:
    'Parameters controlling the shape and magnitude of the current-voltage ' +
    'curve. These relate to the dielectric layer properties and the balance ' +
    'between Ohmic and tunneling conduction.',
  threshold:
    'Voltage thresholds and switching speeds. The device state only changes ' +
    'when the applied voltage exceeds these thresholds, and the A parameters ' +
    'control how fast the switching occurs.',
  state:
    'Parameters governing the state variable\'s motion boundaries and damping. ' +
    'These determine where the state variable transitions from free linear ' +
    'motion to exponentially-damped motion near the physical limits.',
  device:
    'Physical device parameters: film thickness, resistance states, and ' +
    'ion mobility. These are directly measurable material properties.',
};
