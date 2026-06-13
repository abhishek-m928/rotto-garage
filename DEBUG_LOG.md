### \# Debug Log

#### 

#### For each bug you find, fill in an entry below. Be specific about what was broken and how you found it.

#### 

#### For bugs discovered using browser DevTools, include a screenshot.

#### 

#### \---

#### 

### \## Bug 1

#### 

#### \*\*File:\*\* frontend/src/app/login/page.tsx

#### \*\*What was wrong:\*\* The `handleSubmit` function was missing `e.preventDefault()`, causing the form to do a full page reload on submit and cancel the async login request before it could complete.

#### \*\*How you found it:\*\* Tried logging in — nothing happened on screen, no network request fired.

#### \*\*What you changed:\*\* Added `e.preventDefault();` as the first line of `handleSubmit`.

#### 

#### \---

#### 

### \## Bug 2

#### 

#### \*\*File:\*\* frontend/src/hooks/useAuth.ts

#### \*\*What was wrong:\*\* The session-check `useEffect` read the token from `localStorage` using the hardcoded key `'auth\_token'`, but the token was actually saved under `'rotto\_token'` (the `TOKEN\_KEY` constant exported from `lib/api.ts`). This caused the app to think the user was logged out even after a successful login.

#### \*\*How you found it:\*\* After fixing Bug 1, login appeared to succeed but the dashboard redirected back to login.

#### \*\*What you changed:\*\* Replaced `localStorage.getItem('auth\_token')` with `localStorage.getItem(TOKEN\_KEY)`.

#### 

#### \---

#### 

### \## Bug 3

#### 

#### \*\*File:\*\* frontend/src/lib/api.ts

#### \*\*What was wrong:\*\* The `Authorization` header was set to the raw token value instead of the `Bearer <token>` format expected by the backend's `authenticate` middleware. Every authenticated request returned 401.

#### \*\*How you found it:\*\* After login, protected pages (Cars, Bookings, Dashboard) failed to load data.

#### \*\*What you changed:\*\* Changed `headers\['Authorization'] = token` to `headers\['Authorization'] = \\`Bearer ${token}\\``.

#### 

#### \---

#### 

### \## Bug 4

#### 

#### \*\*File:\*\* backend/src/middleware/auth.js

#### \*\*What was wrong:\*\* The `authenticate` middleware verified tokens using `process.env.JWT\_SECRET`, but `authController.js` signed tokens with `process.env.ROTTO\_JWT\_SECRET` — a different environment variable. Token verification always failed with `INVALID\_TOKEN`.

#### \*\*How you found it:\*\* Checked the `.env.example` file and compared the variable names used in `authController.js` vs `auth.js`.

#### \*\*What you changed:\*\* Changed `jwt.verify(token, process.env.JWT\_SECRET)` to `jwt.verify(token, process.env.ROTTO\_JWT\_SECRET)`.

#### 

#### \---

#### 

### \## Bug 5

#### 

#### \*\*File:\*\* backend/src/index.js

#### \*\*What was wrong:\*\* `errorHandler` middleware was registered \*before\* the routes, so it never caught errors thrown inside route handlers. Errors were returned as raw unformatted HTML instead of JSON.

#### \*\*How you found it:\*\* Tried adding a car with a duplicate registration number — got a raw HTML error page (`ValidationError: Car validation failed...`) in the Network tab Response instead of a JSON error.

#### \*\*What you changed:\*\* Moved `app.use(errorHandler)` to the very end of the middleware chain, after all routes and the 404 handler.

#### \*\*Screenshot:\*\* See response body showing raw HTML `<pre>ValidationError...</pre>` before the fix.

#### 

#### \---

#### 

### \## Bug 6

#### 

#### \*\*File:\*\* frontend/src/components/Modal.tsx

#### \*\*What was wrong:\*\* The modal backdrop used `position: 'static'` instead of `position: 'fixed'`, so the "Add a car" modal didn't overlay the page properly and the page became unscrollable, hiding the submit button.

#### \*\*How you found it:\*\* Opened the "Add a car" modal — could not scroll up or down to see the form fully or click "Add Car".

#### \*\*What you changed:\*\* Changed `position: 'static'` to `position: 'fixed'` and added `inset: 0` to the backdrop style.

#### \*\*Screenshot:\*\* See screenshot of the stuck modal before the fix.

#### 

#### \---

#### 

### \## Bug 7

#### 

#### \*\*File:\*\* backend/src/controllers/carController.js

#### \*\*What was wrong:\*\* The `createCar` function did not extract or save the `registrationNumber` field from the request body, even though the schema requires it. Adding any car failed with `ValidationError: registrationNumber: Registration number is required`.

#### \*\*How you found it:\*\* After fixing Bug 5 (error handler), the "Add a car" form returned a clear JSON error: "registrationNumber: Registration number is required" in the Network tab.

#### \*\*What you changed:\*\* Added `registrationNumber` to the destructured request body and to the `Car.create()` call.

#### \*\*Screenshot:\*\* See screenshot of the validation error message in the modal.

#### 

#### \---

#### 

### \## Bug 8

#### 

#### \*\*File:\*\* backend/src/models/Booking.js

#### \*\*What was wrong:\*\* The `userId` field in the Booking schema was typed as `String` instead of `mongoose.Schema.Types.ObjectId`. This meant `userId` was stored as a plain string, so MongoDB `$lookup`/`populate` on `userId` in the admin stats aggregation returned an unpopulated string instead of the user object.

#### \*\*How you found it:\*\* Tested the new `/api/admin/stats` endpoint — `recentBookings\[].userId` returned as a raw ObjectId string instead of a populated user object with name/email, while `carId` (already typed as ObjectId) populated correctly.

#### \*\*What you changed:\*\* Changed `userId: { type: String, ref: 'User', required: true }` to `userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }`. Deleted the old booking document (which had `userId` stored as a string) and created a fresh booking so it would be saved with the correct ObjectId type.

#### \*\*Screenshot:\*\* See before/after stats responses — before shows `"userId": "6a2999cb..."` (string), after shows `"userId": { "\_id": ..., "name": "Abhishek", "email": ... }` (populated object).

#### 

#### \---

#### 

### \## Hard Feature

#### 

#### \*\*Option chosen:\*\* Part A — Aggregation Stats Endpoint

#### 

#### \*\*Approach:\*\* Created a new admin-only route `GET /api/admin/stats`, protected by `authenticate` and `requireAdmin` middleware. The controller (`adminController.js`) uses a single MongoDB aggregation pipeline with `$facet` to compute four things in one query:

#### 1\. `byStatus` — booking counts grouped by status (pending, confirmed, etc.)

#### 2\. `byServiceType` — booking counts grouped by service type

#### 3\. `recentBookings` — the 5 most recent bookings, with `carId` and `userId` populated via `$lookup`/`$unwind` (excluding the password field from the populated user using a `$project` pipeline inside the lookup)

#### 4\. `totalRevenue` — sum of `estimatedCost` across all bookings

#### 

#### Tested by promoting a user to `role: "admin"` in the database, signing back in to refresh the JWT (which encodes the role), and calling the endpoint with the token in the `Authorization: Bearer` header from the browser console. Verified the response correctly reflects bookings created in the app, including populated user/car data and the correct revenue total.

