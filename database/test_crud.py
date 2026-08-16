from models import init_db
from crud import create_campaign, get_campaign_by_id

# 1. Make sure your local PostgreSQL tables are generated
print("🛠️ Connecting to PostgreSQL and verifying tables...")
init_db()

print("\n🚀 Testing CRUD Operations...")

# 2. Test Creating a Campaign 
# Note: Ensure a user with id=1 exists in your database table first, 
# or change user_id to a valid ID in your database.
try:
    new_camp = create_campaign(
        user_id=1, 
        campaign_name="Summer Launch 2026"
    )
    print(f"✅ Successfully Created Campaign: {new_camp.campaign_name} (ID: {new_camp.id})")
    
    # 3. Test Reading the Campaign back
    fetched_camp = get_campaign_by_id(new_camp.id)
    if fetched_camp:
        print(f"📖 Successfully Read Campaign from DB: {fetched_camp.campaign_name}")
    else:
        print("❌ Could not read the campaign back.")
        
except Exception as e:
    print(f"❌ Error during test: {e}")
    print("💡 Tip: If you get a ForeignKey violation, make sure a User with ID 1 exists in your users table first!")