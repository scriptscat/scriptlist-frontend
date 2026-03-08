/**
 * Pre-register known Iconify icons for offline usage.
 * Import this module once in the root layout to register all icons globally.
 * Any icon not registered here will fallback to online fetching automatically.
 */
import { addIcon } from '@iconify/react';

// mingcute
import qqFill from '@iconify-icons/mingcute/qq-fill';
// Note: mingcute:robot-line is not available in @iconify-icons/mingcute yet,
// it will fallback to online fetching automatically.

// logos - homepage browser buttons
import chrome from '@iconify-icons/logos/chrome';
import firefox from '@iconify-icons/logos/firefox';
import microsoftEdge from '@iconify-icons/logos/microsoft-edge';

// logos - script detail browser support
import safari from '@iconify-icons/logos/safari';
import opera from '@iconify-icons/logos/opera';

// noto
import notoPackage from '@iconify-icons/noto/package';

// mdi - common OIDC providers
import mdiGithub from '@iconify-icons/mdi/github';
import mdiGoogle from '@iconify-icons/mdi/google';
import mdiMicrosoft from '@iconify-icons/mdi/microsoft';
import mdiApple from '@iconify-icons/mdi/apple';

// Register all icons
addIcon('mingcute:qq-fill', qqFill);

addIcon('logos:chrome', chrome);
addIcon('logos:firefox', firefox);
addIcon('logos:microsoft-edge', microsoftEdge);
addIcon('logos:safari', safari);
addIcon('logos:opera', opera);

addIcon('noto:package', notoPackage);

addIcon('mdi:github', mdiGithub);
addIcon('mdi:google', mdiGoogle);
addIcon('mdi:microsoft', mdiMicrosoft);
addIcon('mdi:apple', mdiApple);
