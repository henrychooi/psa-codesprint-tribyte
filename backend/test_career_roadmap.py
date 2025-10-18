"""
Test script for Career Roadmap AI Integration
Tests the new AI-powered career prediction functionality
"""

import requests
import json

# Configuration
API_BASE = "http://localhost:5000/api"
TEST_EMPLOYEE_ID = "EMP-20001"  # Samantha Lee - Cloud Solutions Architect

def test_login():
    """Test login to get auth token"""
    print("\n🔐 Testing Login...")
    response = requests.post(
        f"{API_BASE}/auth/login",
        json={
            "username": "admin",
            "password": "admin123"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            token = data.get('token')
            print(f"✅ Login successful! Token: {token}")
            return token
        else:
            print(f"❌ Login failed: {data.get('error')}")
            return None
    else:
        print(f"❌ Login failed with status {response.status_code}")
        return None


def test_current_roadmap(token):
    """Test current roadmap endpoint"""
    print("\n📊 Testing Current Roadmap (Employee View)...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{API_BASE}/career-roadmap/current/{TEST_EMPLOYEE_ID}?limit=50",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            roadmap = data.get('data')
            print(f"✅ Current Roadmap Retrieved!")
            print(f"   Current Role: {roadmap['current_position']['title']}")
            print(f"   Tenure: {roadmap['current_position']['tenure_years']} years")
            print(f"   Next Roles: {len(roadmap['next_logical_roles'])} opportunities")
            print(f"   Skills to Develop: {len(roadmap['skills_to_develop'])} skills")
            return True
        else:
            print(f"❌ Failed: {data.get('error')}")
            return False
    else:
        print(f"❌ Request failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False


def test_predicted_roadmap(token):
    """Test AI-powered predicted roadmap endpoint"""
    print("\n🔮 Testing Predicted Roadmap with AI (Admin View)...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{API_BASE}/career-roadmap/predicted/{TEST_EMPLOYEE_ID}?scenarios=steady_growth,aggressive_growth&limit=40",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            predictions = data.get('data')
            print(f"✅ Predicted Roadmap Retrieved!")
            print(f"   Analysis Date: {predictions['analysis_date']}")
            print(f"   Scenarios: {len(predictions['scenarios'])}")
            
            for scenario_name, scenario_data in predictions['scenarios'].items():
                print(f"\n   📈 {scenario_name.replace('_', ' ').title()}:")
                print(f"      Success Probability: {scenario_data['success_probability']*100:.0f}%")
                print(f"      Promotion Probability: {scenario_data['promotion_probability']*100:.0f}%")
                print(f"      Salary Growth: {scenario_data['salary_growth_estimate']['total_growth_multiplier']}")
                print(f"      Milestones: {len(scenario_data['milestones'])} over 10 years")
                
                # Show first few milestones
                print(f"      First 3 Milestones:")
                for milestone in scenario_data['milestones'][:3]:
                    if milestone.get('role'):
                        print(f"        Year {milestone['year']}: {milestone['role']}")
                    else:
                        print(f"        Year {milestone['year']}: Skill development")
            
            return True
        else:
            print(f"❌ Failed: {data.get('error')}")
            return False
    else:
        print(f"❌ Request failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False


def test_scenario_comparison(token):
    """Test scenario comparison endpoint"""
    print("\n⚖️ Testing Scenario Comparison (Admin View)...")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(
        f"{API_BASE}/career-roadmap/comparison/{TEST_EMPLOYEE_ID}?limit=40",
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get('success'):
            comparison = data.get('data')
            print(f"✅ Scenario Comparison Retrieved!")
            print(f"   Employee: {comparison['employee_name']}")
            print(f"   Optimal Path: {comparison['optimal_recommendation'].replace('_', ' ').title()}")
            print(f"   Scenarios Compared: {len(comparison['scenarios_comparison'])}")
            print(f"   Risk Factors: {len(comparison['risk_analysis'])}")
            
            print(f"\n   Scenario Success Rates:")
            for scenario in comparison['scenarios_comparison']:
                print(f"      {scenario['scenario'].replace('_', ' ').title()}: "
                      f"{scenario['success_probability']*100:.0f}% success")
            
            return True
        else:
            print(f"❌ Failed: {data.get('error')}")
            return False
    else:
        print(f"❌ Request failed with status {response.status_code}")
        print(f"   Response: {response.text}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("🚀 Career Roadmap API Test Suite")
    print("=" * 60)
    
    # Login first
    token = test_login()
    if not token:
        print("\n❌ Cannot continue without authentication token")
        return
    
    # Run tests
    results = []
    results.append(("Current Roadmap", test_current_roadmap(token)))
    results.append(("Predicted Roadmap (AI)", test_predicted_roadmap(token)))
    results.append(("Scenario Comparison", test_scenario_comparison(token)))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Summary")
    print("=" * 60)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {test_name}")
    
    total_passed = sum(1 for _, passed in results if passed)
    print(f"\nTotal: {total_passed}/{len(results)} tests passed")
    
    if total_passed == len(results):
        print("\n🎉 All tests passed! Career Roadmap is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")


if __name__ == "__main__":
    main()
