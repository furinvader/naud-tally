export type AddGuestFlowCopy = {
  roomStepLabel: string;
  roomStepTitle: string;
  roomNumberLabel: string;
  roomNumberAction: string;
  nameStepLabel: string;
  nameStepTitle: string;
  fullNameLabel: string;
  fullNameAction: string;
  backAction: string;
  cancelAction: string;
  roomLabel: string;
};

export type ActiveGuestListCopy = {
  activeGuestsLabel: string;
  addYourself: string;
  guestListTitle: string;
  guestListHint: string;
  emptyGuestListTitle: string;
  emptyGuestListBody: string;
  roomLabel: string;
  guestSummaryFallback: string;
};

export type SelectedGuestPanelCopy = {
  personalPanelEyebrow: string;
  roomLabel: string;
  totalLabel: string;
  closeNowAction: string;
  inactivityHint: string;
  drinkSubtitle: string;
  countLabel: string;
};

export type PlaceholderCopy = {
  personalPanelEyebrow: string;
  personalPanelPlaceholderTitle: string;
  personalPanelPlaceholderBody: string;
  totalLabel: string;
  totalCaption: string;
  activeGuestsLabel: string;
  activeGuestsCaption: string;
};

export type SelectedGuestPanelSectionCopy = {
  selectedGuestPanel: SelectedGuestPanelCopy;
  placeholder: PlaceholderCopy;
};

export type DrinkTallyCopy = {
  title: string;
  addGuestFlow: AddGuestFlowCopy;
  activeGuestList: ActiveGuestListCopy;
  selectedGuestPanel: SelectedGuestPanelCopy;
  placeholder: PlaceholderCopy;
};

export const DRINK_TALLY_COPY = {
  title: 'Naud Tally',
  addGuestFlow: {
    roomStepLabel: 'Step 1 of 2',
    roomStepTitle: 'Enter your room number',
    roomNumberLabel: 'Room number',
    roomNumberAction: 'Continue',
    nameStepLabel: 'Step 2 of 2',
    nameStepTitle: 'Enter your full name',
    fullNameLabel: 'Full name',
    fullNameAction: 'Open tab',
    backAction: 'Back',
    cancelAction: 'Cancel',
    roomLabel: 'Room',
  },
  activeGuestList: {
    activeGuestsLabel: 'Active guests',
    addYourself: 'Add yourself',
    guestListTitle: 'Active guest tabs',
    guestListHint: 'Tap a guest to continue tallying drinks.',
    emptyGuestListTitle: 'No guest tabs yet',
    emptyGuestListBody: 'Use Add yourself to open the first tab on this shared tablet.',
    roomLabel: 'Room',
    guestSummaryFallback: 'No drinks recorded yet.',
  },
  selectedGuestPanel: {
    personalPanelEyebrow: 'Selected guest',
    roomLabel: 'Room',
    totalLabel: 'Total drinks',
    closeNowAction: 'Tap to close now',
    inactivityHint: 'This personal tab closes after 180 seconds of inactivity.',
    drinkSubtitle: 'Quick tally',
    countLabel: 'Recorded',
  },
  placeholder: {
    personalPanelEyebrow: 'Selected guest',
    personalPanelPlaceholderTitle: 'Choose a guest to start tallying.',
    personalPanelPlaceholderBody:
      'Returning guests can tap their tab from the public list. New guests can use Add yourself first.',
    totalLabel: 'Total drinks',
    totalCaption: 'Across all active guest tabs',
    activeGuestsLabel: 'Active guests',
    activeGuestsCaption: 'Open tabs on this tablet',
  },
} as const satisfies DrinkTallyCopy;
