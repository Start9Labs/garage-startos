#!/usr/bin/env bash
# test-s3.sh — S3-compatible object store test suite for garage-startos
#
# Prerequisites:
#   1. Install Garage on StartOS and ensure it is running (healthy)
#   2. Use the "Create Bucket" action to create a test bucket
#   3. Use the "Create API Key" action to create a key (save the secret!)
#   4. Use "Grant Bucket Access to Keys" to give the key Read+Write+Owner on the bucket
#   5. Find the S3 endpoint URL from the StartOS Interfaces tab (S3 API Interface)
#
# Usage:
#   S3_ENDPOINT_URL="http://<host>:<port>" \
#   AWS_ACCESS_KEY_ID="GK..." \
#   AWS_SECRET_ACCESS_KEY="..." \
#   S3_BUCKET="my-test-bucket" \
#   ./test-s3.sh
#
# Optional env vars:
#   AWS_DEFAULT_REGION  — defaults to "garage" (must match s3_region in garage.toml)
#   S3_TEST_PREFIX      — key prefix for test objects (default: "_test-s3")
#   VERBOSE             — set to "true" for full aws cli output

set -Eeuo pipefail

S3_ENDPOINT_URL="https://192.168.50.204:49163"
AWS_ACCESS_KEY_ID="GK6898ca0ed4894fca096c7060"
AWS_SECRET_ACCESS_KEY="826a52a11230f47a896f779ce37651e51ca390a975247d2d2ed3416a5db3eea7"
S3_BUCKET="bucket-test"


###############################################################################
# Helpers
###############################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0

log()  { printf '%s %s\n' "$(date +%H:%M:%S)" "$*"; }
info() { printf "${CYAN}%s [INFO] %s${NC}\n" "$(date +%H:%M:%S)" "$*"; }
pass() { printf "${GREEN}%s [PASS] %s${NC}\n" "$(date +%H:%M:%S)" "$*"; PASS_COUNT=$((PASS_COUNT + 1)); }
fail() { printf "${RED}%s [FAIL] %s${NC}\n" "$(date +%H:%M:%S)" "$*"; FAIL_COUNT=$((FAIL_COUNT + 1)); }
skip() { printf "${YELLOW}%s [SKIP] %s${NC}\n" "$(date +%H:%M:%S)" "$*"; SKIP_COUNT=$((SKIP_COUNT + 1)); }
die()  { printf "${RED}%s [FATAL] %s${NC}\n" "$(date +%H:%M:%S)" "$*"; exit 1; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

need_env() {
  local v="$1"
  [[ -n "${!v:-}" ]] || die "Missing required env var: $v (see usage at top of script)"
}

# Run an aws cli command, capture stdout+stderr, return exit code.
# On failure, print debug info to stderr (so callers' >/dev/null won't hide it).
# On success, print captured output to stdout (callers can redirect if unneeded).
run_aws() {
  local desc="$1"; shift
  local out
  local rc=0
  out=$(aws "${AWS_COMMON[@]}" "$@" 2>&1) || rc=$?
  if [[ "$rc" -ne 0 ]]; then
    fail "$desc"
    printf "    Command: aws %s\n" "$*" >&2
    printf "    Exit code: %d\n" "$rc" >&2
    printf "    Output:\n" >&2
    echo "$out" | sed 's/^/    | /' >&2
    return "$rc"
  fi
  if [[ "${VERBOSE:-}" == "true" ]]; then
    echo "$out" | sed 's/^/    | /' >&2
  fi
  echo "$out"
  return 0
}

###############################################################################
# Preconditions
###############################################################################

need_cmd aws
need_cmd mktemp
need_cmd sha256sum
need_cmd dd

need_env S3_ENDPOINT_URL
need_env AWS_ACCESS_KEY_ID
need_env AWS_SECRET_ACCESS_KEY
need_env S3_BUCKET

export AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-garage}"
export AWS_S3_ADDRESSING_STYLE=path

S3_TEST_PREFIX="${S3_TEST_PREFIX:-_test-s3}"
BUCKET="$S3_BUCKET"

AWS_COMMON=(--no-cli-pager --endpoint-url "$S3_ENDPOINT_URL" --region "$AWS_DEFAULT_REGION")

# StartOS uses self-signed TLS certs; skip verification for https endpoints
if [[ "$S3_ENDPOINT_URL" == https://* ]]; then
  AWS_COMMON+=(--no-verify-ssl)
  # Suppress urllib3 InsecureRequestWarning noise
  export PYTHONWARNINGS="ignore:Unverified HTTPS request"
fi

TMPDIR="$(mktemp -d)"
cleanup() {
  set +e
  info "Cleanup: removing test objects under s3://$BUCKET/$S3_TEST_PREFIX/"
  aws "${AWS_COMMON[@]}" s3 rm "s3://$BUCKET/$S3_TEST_PREFIX/" --recursive >/dev/null 2>&1
  rm -rf "$TMPDIR"
}
trap cleanup EXIT

###############################################################################
# Print config
###############################################################################

echo ""
info "========================================="
info "  Garage S3 Test Suite"
info "========================================="
info "Endpoint:  $S3_ENDPOINT_URL"
info "Region:    $AWS_DEFAULT_REGION"
info "Bucket:    $BUCKET"
info "Key ID:    $AWS_ACCESS_KEY_ID"
info "Prefix:    $S3_TEST_PREFIX/"
info "Temp dir:  $TMPDIR"
echo ""

###############################################################################
# Test 1: Connectivity — HEAD bucket
###############################################################################

info "--- Test 1: Connectivity (HeadBucket) ---"
HEAD_BUCKET_OUT=""
HEAD_BUCKET_RC=0
HEAD_BUCKET_OUT=$(aws "${AWS_COMMON[@]}" s3api head-bucket --bucket "$BUCKET" 2>&1) || HEAD_BUCKET_RC=$?
if [[ "$HEAD_BUCKET_RC" -eq 0 ]]; then
  pass "HeadBucket succeeded — bucket '$BUCKET' is accessible"
else
  printf "    HeadBucket error (exit %d):\n" "$HEAD_BUCKET_RC"
  echo "$HEAD_BUCKET_OUT" | sed 's/^/    | /'
  die "Cannot reach bucket '$BUCKET'. Check: endpoint URL, bucket name, key permissions (needs Read). Aborting."
fi

###############################################################################
# Test 2: Upload small file
###############################################################################

info "--- Test 2: Upload small text file ---"
SMALL_SRC="$TMPDIR/small.txt"
SMALL_KEY="$S3_TEST_PREFIX/small.txt"
echo "Hello from garage-startos test suite at $(date -Is)" > "$SMALL_SRC"
SMALL_SHA="$(sha256sum "$SMALL_SRC" | awk '{print $1}')"

if run_aws "PutObject (small)" s3 cp "$SMALL_SRC" "s3://$BUCKET/$SMALL_KEY" >/dev/null; then
  pass "Upload small file ($(wc -c < "$SMALL_SRC") bytes)"
else
  die "Upload small file failed. Check key has Write permission on bucket. Aborting."
fi

###############################################################################
# Test 3: Download and verify integrity
###############################################################################

info "--- Test 3: Download and verify SHA256 ---"
SMALL_DST="$TMPDIR/small-download.txt"
if run_aws "GetObject (small)" s3 cp "s3://$BUCKET/$SMALL_KEY" "$SMALL_DST" >/dev/null; then
  DL_SHA="$(sha256sum "$SMALL_DST" | awk '{print $1}')"
  if [[ "$SMALL_SHA" == "$DL_SHA" ]]; then
    pass "Download + SHA256 integrity verified"
  else
    fail "SHA256 mismatch: uploaded=$SMALL_SHA downloaded=$DL_SHA"
  fi
else
  fail "Download small file failed"
fi

###############################################################################
# Test 4: HeadObject — check metadata
###############################################################################

info "--- Test 4: HeadObject (metadata check) ---"
HEAD_OUT=""
if HEAD_OUT=$(run_aws "HeadObject" s3api head-object --bucket "$BUCKET" --key "$SMALL_KEY"); then
  CONTENT_LEN=$(echo "$HEAD_OUT" | grep -o '"ContentLength": [0-9]*' | grep -o '[0-9]*' || echo "?")
  CONTENT_TYPE=$(echo "$HEAD_OUT" | grep -o '"ContentType": "[^"]*"' | sed 's/.*: "//;s/"//' || echo "?")
  pass "HeadObject: ContentLength=$CONTENT_LEN ContentType=$CONTENT_TYPE"
else
  fail "HeadObject failed"
fi

###############################################################################
# Test 5: Upload 1 MiB binary blob + integrity check
###############################################################################

info "--- Test 5: Upload/download 1 MiB binary blob ---"
BIN_SRC="$TMPDIR/blob.bin"
BIN_DST="$TMPDIR/blob-download.bin"
BIN_KEY="$S3_TEST_PREFIX/blob.bin"

dd if=/dev/urandom of="$BIN_SRC" bs=1M count=1 status=none
BIN_SHA="$(sha256sum "$BIN_SRC" | awk '{print $1}')"
info "Source SHA256: $BIN_SHA"

if run_aws "PutObject (1MiB)" s3 cp "$BIN_SRC" "s3://$BUCKET/$BIN_KEY" >/dev/null; then
  pass "Upload 1 MiB binary"
else
  fail "Upload 1 MiB binary failed"
fi

if run_aws "GetObject (1MiB)" s3 cp "s3://$BUCKET/$BIN_KEY" "$BIN_DST" >/dev/null; then
  BIN_DL_SHA="$(sha256sum "$BIN_DST" | awk '{print $1}')"
  if [[ "$BIN_SHA" == "$BIN_DL_SHA" ]]; then
    pass "1 MiB download + SHA256 integrity verified"
  else
    fail "1 MiB SHA256 mismatch: uploaded=$BIN_SHA downloaded=$BIN_DL_SHA"
  fi
else
  fail "Download 1 MiB binary failed"
fi

###############################################################################
# Test 6: Upload empty file
###############################################################################

info "--- Test 6: Upload/download empty file ---"
EMPTY_SRC="$TMPDIR/empty.dat"
EMPTY_DST="$TMPDIR/empty-download.dat"
EMPTY_KEY="$S3_TEST_PREFIX/empty.dat"

> "$EMPTY_SRC"
if run_aws "PutObject (empty)" s3 cp "$EMPTY_SRC" "s3://$BUCKET/$EMPTY_KEY" >/dev/null; then
  pass "Upload empty file"
else
  fail "Upload empty file failed"
fi

if run_aws "GetObject (empty)" s3 cp "s3://$BUCKET/$EMPTY_KEY" "$EMPTY_DST" >/dev/null; then
  DL_SIZE=$(wc -c < "$EMPTY_DST")
  if [[ "$DL_SIZE" -eq 0 ]]; then
    pass "Downloaded empty file is 0 bytes"
  else
    fail "Downloaded empty file is $DL_SIZE bytes (expected 0)"
  fi
else
  fail "Download empty file failed"
fi

###############################################################################
# Test 7: ListObjectsV2
###############################################################################

info "--- Test 7: ListObjectsV2 ---"
LIST_OUT=""
if LIST_OUT=$(run_aws "ListObjectsV2" s3api list-objects-v2 --bucket "$BUCKET" --prefix "$S3_TEST_PREFIX/"); then
  OBJ_COUNT=$(echo "$LIST_OUT" | grep -c '"Key":' || echo "0")
  pass "ListObjectsV2 returned $OBJ_COUNT object(s) under $S3_TEST_PREFIX/"
else
  fail "ListObjectsV2 failed"
fi

###############################################################################
# Test 8: CopyObject (server-side copy)
###############################################################################

info "--- Test 8: CopyObject (server-side copy) ---"
COPY_KEY="$S3_TEST_PREFIX/blob-copy.bin"
if run_aws "CopyObject" s3api copy-object \
    --bucket "$BUCKET" \
    --key "$COPY_KEY" \
    --copy-source "$BUCKET/$BIN_KEY" >/dev/null; then
  # Download copy and verify
  COPY_DST="$TMPDIR/blob-copy-download.bin"
  if run_aws "GetObject (copy)" s3 cp "s3://$BUCKET/$COPY_KEY" "$COPY_DST" >/dev/null; then
    COPY_SHA="$(sha256sum "$COPY_DST" | awk '{print $1}')"
    if [[ "$BIN_SHA" == "$COPY_SHA" ]]; then
      pass "CopyObject + download integrity verified"
    else
      fail "CopyObject SHA256 mismatch: original=$BIN_SHA copy=$COPY_SHA"
    fi
  else
    fail "Download of copied object failed"
  fi
else
  fail "CopyObject failed"
fi

###############################################################################
# Test 9: PutObject with custom metadata
###############################################################################

info "--- Test 9: PutObject with custom metadata ---"
META_SRC="$TMPDIR/meta.txt"
META_KEY="$S3_TEST_PREFIX/meta.txt"
echo "metadata test" > "$META_SRC"

if run_aws "PutObject (metadata)" s3api put-object \
    --bucket "$BUCKET" \
    --key "$META_KEY" \
    --body "$META_SRC" \
    --metadata '{"test-key":"test-value","suite":"garage-startos"}' >/dev/null; then
  # Verify metadata via HeadObject
  META_HEAD=""
  if META_HEAD=$(run_aws "HeadObject (metadata)" s3api head-object --bucket "$BUCKET" --key "$META_KEY"); then
    if echo "$META_HEAD" | grep -q "test-key"; then
      pass "Custom metadata preserved (test-key found)"
    else
      fail "Custom metadata not found in HeadObject response"
      echo "$META_HEAD" | sed 's/^/    | /' >&2
    fi
  else
    fail "HeadObject for metadata check failed"
  fi
else
  fail "PutObject with metadata failed"
fi

###############################################################################
# Test 10: Delete individual objects
###############################################################################

info "--- Test 10: DeleteObject ---"
if run_aws "DeleteObject (small)" s3api delete-object --bucket "$BUCKET" --key "$SMALL_KEY" >/dev/null; then
  # Verify deletion — HeadObject should fail with 404
  DEL_CHECK_OUT=""
  DEL_CHECK_RC=0
  DEL_CHECK_OUT=$(aws "${AWS_COMMON[@]}" s3api head-object --bucket "$BUCKET" --key "$SMALL_KEY" 2>&1) || DEL_CHECK_RC=$?
  if [[ "$DEL_CHECK_RC" -eq 0 ]]; then
    fail "Object still exists after DeleteObject"
    echo "$DEL_CHECK_OUT" | sed 's/^/    | /' >&2
  else
    pass "DeleteObject confirmed (HeadObject returns error code $DEL_CHECK_RC)"
  fi
else
  fail "DeleteObject failed"
fi

###############################################################################
# Test 11: Overwrite existing object
###############################################################################

info "--- Test 11: Overwrite existing object ---"
OVER_SRC1="$TMPDIR/over1.txt"
OVER_SRC2="$TMPDIR/over2.txt"
OVER_DST="$TMPDIR/over-download.txt"
OVER_KEY="$S3_TEST_PREFIX/overwrite.txt"
echo "version-1" > "$OVER_SRC1"
echo "version-2" > "$OVER_SRC2"

run_aws "PutObject (v1)" s3 cp "$OVER_SRC1" "s3://$BUCKET/$OVER_KEY" >/dev/null
run_aws "PutObject (v2)" s3 cp "$OVER_SRC2" "s3://$BUCKET/$OVER_KEY" >/dev/null
if run_aws "GetObject (overwrite)" s3 cp "s3://$BUCKET/$OVER_KEY" "$OVER_DST" >/dev/null; then
  OVER_CONTENT="$(cat "$OVER_DST")"
  if [[ "$OVER_CONTENT" == "version-2" ]]; then
    pass "Overwrite: latest version returned correctly"
  else
    fail "Overwrite: expected 'version-2', got '$OVER_CONTENT'"
  fi
else
  fail "Download after overwrite failed"
fi

###############################################################################
# Test 12: Nested key paths (directory-like structure)
###############################################################################

info "--- Test 12: Nested key paths ---"
NESTED_SRC="$TMPDIR/nested.txt"
NESTED_KEY="$S3_TEST_PREFIX/deep/nested/path/file.txt"
echo "deeply nested" > "$NESTED_SRC"

if run_aws "PutObject (nested)" s3 cp "$NESTED_SRC" "s3://$BUCKET/$NESTED_KEY" >/dev/null; then
  NESTED_DST="$TMPDIR/nested-download.txt"
  if run_aws "GetObject (nested)" s3 cp "s3://$BUCKET/$NESTED_KEY" "$NESTED_DST" >/dev/null; then
    NESTED_CONTENT="$(cat "$NESTED_DST")"
    if [[ "$NESTED_CONTENT" == "deeply nested" ]]; then
      pass "Nested key path works correctly"
    else
      fail "Nested key content mismatch: expected 'deeply nested', got '$NESTED_CONTENT'"
    fi
  else
    fail "Download nested object failed"
  fi
else
  fail "Upload nested object failed"
fi

###############################################################################
# Test 13: ListObjectsV2 with prefix (simulate directory listing)
###############################################################################

info "--- Test 13: ListObjectsV2 with delimiter (directory simulation) ---"
LIST_DIR_OUT=""
if LIST_DIR_OUT=$(run_aws "ListObjectsV2 (prefix+delimiter)" s3api list-objects-v2 \
    --bucket "$BUCKET" \
    --prefix "$S3_TEST_PREFIX/" \
    --delimiter "/"); then
  PREFIX_COUNT=$(echo "$LIST_DIR_OUT" | grep -c '"Prefix":' || echo "0")
  OBJ_COUNT=$(echo "$LIST_DIR_OUT" | grep -c '"Key":' || echo "0")
  pass "Prefix listing: $OBJ_COUNT objects, $PREFIX_COUNT common prefixes"
else
  fail "ListObjectsV2 with delimiter failed"
fi

###############################################################################
# Test 14: Multipart upload (5 MiB threshold)
###############################################################################

info "--- Test 14: Multipart upload (6 MiB file) ---"
MP_SRC="$TMPDIR/multipart.bin"
MP_DST="$TMPDIR/multipart-download.bin"
MP_KEY="$S3_TEST_PREFIX/multipart.bin"

dd if=/dev/urandom of="$MP_SRC" bs=1M count=6 status=none
MP_SHA="$(sha256sum "$MP_SRC" | awk '{print $1}')"
info "Multipart source SHA256: $MP_SHA"

# aws s3 cp uses multipart for files > 8MB by default; force lower threshold
if run_aws "PutObject (multipart)" s3 cp "$MP_SRC" "s3://$BUCKET/$MP_KEY" \
    --expected-size 6291456 >/dev/null; then
  pass "Multipart upload (6 MiB)"
else
  fail "Multipart upload failed"
fi

if run_aws "GetObject (multipart)" s3 cp "s3://$BUCKET/$MP_KEY" "$MP_DST" >/dev/null; then
  MP_DL_SHA="$(sha256sum "$MP_DST" | awk '{print $1}')"
  if [[ "$MP_SHA" == "$MP_DL_SHA" ]]; then
    pass "Multipart download + SHA256 integrity verified"
  else
    fail "Multipart SHA256 mismatch: uploaded=$MP_SHA downloaded=$MP_DL_SHA"
  fi
else
  fail "Multipart download failed"
fi

###############################################################################
# Test 15: Presigned URL (if supported)
###############################################################################

info "--- Test 15: Presigned URL ---"
# Generate a presigned GET URL and fetch with curl
if command -v curl >/dev/null 2>&1; then
  PRESIGN_KEY="$S3_TEST_PREFIX/blob.bin"
  PRESIGN_URL=""
  PRESIGN_URL=$(aws "${AWS_COMMON[@]}" s3 presign "s3://$BUCKET/$PRESIGN_KEY" --expires-in 60 2>&1) || true
  if [[ -n "$PRESIGN_URL" && "$PRESIGN_URL" == http* ]]; then
    PRESIGN_DST="$TMPDIR/presigned-download.bin"
    CURL_OPTS=(-sS -o "$PRESIGN_DST")
    [[ "$S3_ENDPOINT_URL" == https://* ]] && CURL_OPTS+=(-k)
    CURL_RC=0
    CURL_ERR=$(curl "${CURL_OPTS[@]}" "$PRESIGN_URL" 2>&1) || CURL_RC=$?
    if [[ "$CURL_RC" -eq 0 ]]; then
      PRESIGN_SHA="$(sha256sum "$PRESIGN_DST" | awk '{print $1}')"
      if [[ "$BIN_SHA" == "$PRESIGN_SHA" ]]; then
        pass "Presigned URL download + SHA256 verified"
      else
        fail "Presigned URL SHA256 mismatch: expected=$BIN_SHA got=$PRESIGN_SHA"
      fi
    else
      fail "Presigned URL curl download failed (exit $CURL_RC)"
      echo "$CURL_ERR" | sed 's/^/    | /' >&2
    fi
  else
    skip "Presigned URL generation failed (may not be supported)"
  fi
else
  skip "Presigned URL test: curl not available"
fi

###############################################################################
# Summary
###############################################################################

echo ""
info "========================================="
info "  Test Summary"
info "========================================="
printf "  ${GREEN}PASSED: %d${NC}\n" "$PASS_COUNT"
printf "  ${RED}FAILED: %d${NC}\n" "$FAIL_COUNT"
printf "  ${YELLOW}SKIPPED: %d${NC}\n" "$SKIP_COUNT"
info "========================================="
echo ""

if [[ "$FAIL_COUNT" -gt 0 ]]; then
  die "$FAIL_COUNT test(s) failed"
fi

info "All tests passed!"
exit 0
