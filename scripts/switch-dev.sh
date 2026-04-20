#!/bin/bash
# switch-dev.sh — Sprint 2 helper (drunkdev project)
#
# Usage:
#   ./scripts/switch-dev.sh <nickname> <day>
#
# Examples:
#   ./scripts/switch-dev.sh sun 1     # ซัน, Day 1 = 20 เม.ย. 2569
#   ./scripts/switch-dev.sh mik 3     # มิก, Day 3 = 22 เม.ย. 2569

set -e

# Load PAT จาก ~/.sprint2-tokens.env
TOKEN_FILE="$HOME/.sprint2-tokens.env"
if [ -f "$TOKEN_FILE" ]; then
  # shellcheck disable=SC1090
  source "$TOKEN_FILE"
fi

if [ -z "$1" ] || [ -z "$2" ]; then
  cat <<'EOF'
Usage: ./scripts/switch-dev.sh <nickname> <day>

Nicknames: sun, mik, pub, tawan, kwan, guide, grace, fey, dream

Days:
  1 = 20 เม.ย. 2569 (จันทร์)    6 = 25 เม.ย. 2569 (เสาร์)
  2 = 21 เม.ย. 2569 (อังคาร)    7 = 26 เม.ย. 2569 (อาทิตย์)
  3 = 22 เม.ย. 2569 (พุธ)       8 = 27 เม.ย. 2569 (จันทร์)
  4 = 23 เม.ย. 2569 (พฤหัส)     9 = 28 เม.ย. 2569 (อังคาร)
  5 = 24 เม.ย. 2569 (ศุกร์)
EOF
  exit 1
fi

# ============================================================
# ⚠️ แก้ส่วนนี้ให้ตรงข้อมูลจริง
# ------------------------------------------------------------
# วิธีหา noreply email: ให้เพื่อนเข้า GitHub → Settings → Emails
#   จะเห็น "Keep my email addresses private" ติ๊ก ✓ ไว้
#   noreply email อยู่ในรูปแบบ {7 หลัก ID}+{username}@users.noreply.github.com
# ============================================================

case "$1" in
  sun)
    NAME="ซัน"
    EMAIL="50611899+floridunba@users.noreply.github.com"
    USER="floridunba"
    TOKEN="${PAT_SUN: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}"
    ;;
  mik)
    NAME="มิก"
    EMAIL="227040769+bywacharapan@users.noreply.github.com"
    USER="bywacharapan"
    TOKEN="${PAT_MIK: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}"
    ;;
  pub)
    NAME="พับ"
    EMAIL="221391361+Phatchaaa@users.noreply.github.com"
    USER="Phatchaaa"
    TOKEN="${PAT_PUB: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}"
    ;;
  tawan)
    NAME="ตะวัน"
    EMAIL="227013532+Kesist@users.noreply.github.com"
    USER="Kesist"
    TOKEN="${PAT_TAWAN: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}"
    ;;
  kwan)
    NAME="ขวัญ"
    EMAIL="183257131+KwanPitsinee@users.noreply.github.com"
    USER="KwanPitsinee"
    TOKEN="${PAT_KWAN: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}"
    ;;
  guide)
    NAME="ไกด์"
    EMAIL="144545280+NattwatWorrattananuruk@users.noreply.github.com"
    USER="NattwatWorrattananuruk"
    TOKEN="${PAT_GUIDE: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}"
    ;;
  grace)
    NAME="เกรซ"
    EMAIL="227101118+pimjunr-blip@users.noreply.github.com"
    USER="pimjunr-blip"
    TOKEN="${PAT_GRACE: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}"
    ;;
  fey)
    NAME="เฟย"
    EMAIL="226951422+RoskyJ@users.noreply.github.com"
    USER="RoskyJ"
    TOKEN="${PAT_FEY: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}"
    ;;
  dream)
    NAME="ดรีม"
    EMAIL="225168077+thanisorn901@users.noreply.github.com"
    USER="thanisorn901"
    TOKEN="${PAT_DREAM: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}"
    ;;
  *)
    echo "❌ Unknown nickname: $1"
    echo "Available: sun, mik, pub, tawan, kwan, guide, grace, fey, dream"
    exit 1
    ;;
esac

# Set git config (local — per repo)
git config user.name "$NAME"
git config user.email "$EMAIL"

# Set remote URL with PAT
if [ -n "$TOKEN" ]; then
  REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
  if [ -n "$REMOTE_URL" ]; then
    REPO_PATH=$(echo "$REMOTE_URL" | sed -E 's|https?://([^@]*@)?github.com/||; s|\.git$||')
    NEW_URL="https://${USER}:${TOKEN}@github.com/${REPO_PATH}.git"
    git remote set-url origin "$NEW_URL"
  fi
fi

# Set commit date
case "$2" in
  1) COMMIT_DATE="2026-04-20T13:12:33+07:00" ;;
  2) COMMIT_DATE="2026-04-21T12:13:22+07:00" ;;
  3) COMMIT_DATE="2026-04-22T13:09:34+07:00" ;;
  4) COMMIT_DATE="2026-04-23T11:20:45+07:00" ;;
  5) COMMIT_DATE="2026-04-24T13:33:24+07:00" ;;
  6) COMMIT_DATE="2026-04-25T11:22:30+07:00" ;;
  7) COMMIT_DATE="2026-04-26T11:40:44+07:00" ;;
  8) COMMIT_DATE="2026-04-27T12:20:34+07:00" ;;
  9) COMMIT_DATE="2026-04-28T10:11:24+07:00" ;;
  *)
    echo "⚠️ Unknown day: $2 (ใช้ 1-9)"
    exit 1
    ;;
esac

cat > .sprint2-date.env <<EOF
export GIT_AUTHOR_DATE="$COMMIT_DATE"
export GIT_COMMITTER_DATE="$COMMIT_DATE"
EOF

echo "════════════════════════════════════════════════"
echo "✅ Identity: $NAME <$EMAIL>"
echo "   GitHub: $USER"
echo "📅 Commit date: $COMMIT_DATE (Day $2)"
echo "📂 Repo: $(basename "$(pwd)")"
echo "🌿 Branch: $(git branch --show-current)"
[ -z "$TOKEN" ] && echo "⚠️  ไม่พบ PAT — ตั้งค่าใน $TOKEN_FILE"
echo "════════════════════════════════════════════════"
echo ""
echo "👉 ขั้นตอนต่อไป: source .sprint2-date.env"
